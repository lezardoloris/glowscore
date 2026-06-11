import UIKit
import Foundation

final class TransformationService {
    enum TransformError: LocalizedError {
        case networkError(String)
        case apiError(String)
        case notSubscribed
        case dailyLimitReached
        case invalidResponse

        var errorDescription: String? {
            switch self {
            case .networkError(let msg): return "Network error: \(msg)"
            case .apiError(let msg): return "AI error: \(msg)"
            case .notSubscribed: return "Subscribe to unlock HD transformations."
            case .dailyLimitReached: return "You've reached your daily limit of \(Configuration.maxHDTransformsPerDay) HD transformations."
            case .invalidResponse: return "Invalid response from server. Please try again."
            }
        }
    }

    private let session: URLSession
    // M2 FIX: Use singleton CIContext (expensive to create, now shared across services)
    private var ciContext: CIContext { CIContextProvider.shared.context }

    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
    }

    /// Cloud HD transformation via Cloudflare Worker → fal.ai
    func transformHD(image: UIImage, style: StylePreset, subscriberToken: String) async throws -> UIImage {
        guard let imageData = image.jpegData(compressionQuality: 0.85) else {
            throw TransformError.apiError("Could not encode image")
        }

        let base64Image = imageData.base64EncodedString()

        // H1 FIX: Only send style_id, server looks up prompt
        let requestBody: [String: Any] = [
            "image": base64Image,
            "style_id": style.id,
            "width": Int(Configuration.hdSize),
            "height": Int(Configuration.hdSize)
        ]

        // C3 FIX: Guard URL construction instead of force-unwrap
        guard let url = URL(string: Configuration.transformEndpoint) else {
            throw TransformError.apiError("Invalid server configuration")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(subscriberToken)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw TransformError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200:
            guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let imageURLString = json["image_url"] as? String,
                  let imageURL = URL(string: imageURLString) else {
                throw TransformError.invalidResponse
            }

            // Download the generated image
            let (imageData, _) = try await session.data(from: imageURL)
            guard let resultImage = UIImage(data: imageData) else {
                throw TransformError.invalidResponse
            }
            return resultImage

        case 401:
            throw TransformError.notSubscribed
        case 429:
            throw TransformError.dailyLimitReached
        default:
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw TransformError.apiError(errorMessage)
        }
    }

    /// On-device preview transformation (free tier)
    func transformPreview(image: UIImage, style: StylePreset) async throws -> UIImage {
        // For MVP, apply a Core Image filter chain as the on-device "preview"
        // In production, replace with actual Core ML model
        guard let ciImage = CIImage(image: image) else {
            throw TransformError.apiError("Could not process image")
        }

        let context = ciContext
        var outputImage = ciImage

        // Apply style-appropriate filter chain
        switch style.id {
        case "clear_skin":
            // Smooth skin + brighten
            if let smoothFilter = CIFilter(name: "CIGaussianBlur") {
                smoothFilter.setValue(outputImage, forKey: kCIInputImageKey)
                smoothFilter.setValue(2.0, forKey: kCIInputRadiusKey)
                if let blurred = smoothFilter.outputImage {
                    // Blend original with blurred for skin smoothing effect
                    if let blendFilter = CIFilter(name: "CISourceAtopCompositing") {
                        blendFilter.setValue(blurred, forKey: kCIInputImageKey)
                        blendFilter.setValue(outputImage, forKey: kCIInputBackgroundImageKey)
                        outputImage = blendFilter.outputImage ?? outputImage
                    }
                }
            }
            // Brighten
            if let brighten = CIFilter(name: "CIColorControls") {
                brighten.setValue(outputImage, forKey: kCIInputImageKey)
                brighten.setValue(0.05, forKey: kCIInputBrightnessKey)
                brighten.setValue(1.1, forKey: kCIInputContrastKey)
                brighten.setValue(1.05, forKey: kCIInputSaturationKey)
                outputImage = brighten.outputImage ?? outputImage
            }

        case "model_look":
            // High contrast + warm tones
            if let controls = CIFilter(name: "CIColorControls") {
                controls.setValue(outputImage, forKey: kCIInputImageKey)
                controls.setValue(0.03, forKey: kCIInputBrightnessKey)
                controls.setValue(1.2, forKey: kCIInputContrastKey)
                controls.setValue(1.1, forKey: kCIInputSaturationKey)
                outputImage = controls.outputImage ?? outputImage
            }
            if let vignette = CIFilter(name: "CIVignette") {
                vignette.setValue(outputImage, forKey: kCIInputImageKey)
                vignette.setValue(1.0, forKey: kCIInputIntensityKey)
                vignette.setValue(2.0, forKey: kCIInputRadiusKey)
                outputImage = vignette.outputImage ?? outputImage
            }

        case "age_rewind":
            // Soften + warm + brighten
            if let controls = CIFilter(name: "CIColorControls") {
                controls.setValue(outputImage, forKey: kCIInputImageKey)
                controls.setValue(0.08, forKey: kCIInputBrightnessKey)
                controls.setValue(0.95, forKey: kCIInputContrastKey)
                controls.setValue(1.05, forKey: kCIInputSaturationKey)
                outputImage = controls.outputImage ?? outputImage
            }
            if let smooth = CIFilter(name: "CIGaussianBlur") {
                smooth.setValue(outputImage, forKey: kCIInputImageKey)
                smooth.setValue(1.5, forKey: kCIInputRadiusKey)
                outputImage = smooth.outputImage ?? outputImage
            }

        default:
            // Generic enhancement
            if let controls = CIFilter(name: "CIColorControls") {
                controls.setValue(outputImage, forKey: kCIInputImageKey)
                controls.setValue(0.03, forKey: kCIInputBrightnessKey)
                controls.setValue(1.1, forKey: kCIInputContrastKey)
                controls.setValue(1.05, forKey: kCIInputSaturationKey)
                outputImage = controls.outputImage ?? outputImage
            }
        }

        // Resize to preview size (use min dimension for consistent square output)
        let minDim = min(outputImage.extent.width, outputImage.extent.height)
        let scale = Configuration.previewSize / max(minDim, 1)
        let scaledImage = outputImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

        guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else {
            throw TransformError.apiError("Could not generate preview")
        }

        let result = UIImage(cgImage: cgImage)

        // v1.2: No watermarks on free tier — clean results for everyone
        return result
    }
}
