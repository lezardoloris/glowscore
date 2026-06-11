import UIKit
import Foundation

final class FeatureService {
    static let shared = FeatureService()

    enum FeatureError: LocalizedError {
        case networkError(String)
        case apiError(String)
        case invalidResponse
        case encodingFailed

        var errorDescription: String? {
            switch self {
            case .networkError(let msg): return "Network error: \(msg)"
            case .apiError(let msg): return "AI error: \(msg)"
            case .invalidResponse: return "Invalid response from server. Please try again."
            case .encodingFailed: return "Could not encode image. Please try another photo."
            }
        }
    }

    private let session: URLSession

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 60
        config.timeoutIntervalForResource = 120
        self.session = URLSession(configuration: config)
    }

    // MARK: - Public API

    func faceSwap(source: UIImage, target: UIImage, quality: String = "standard") async throws -> UIImage {
        let body: [String: Any] = [
            "source_image": try encodeImage(source),
            "target_image": try encodeImage(target),
            "quality": quality
        ]
        return try await postRequest(endpoint: "/api/face-swap", body: body)
    }

    func instantStyle(image: UIImage, style: String, quality: String = "standard") async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "style": style,
            "quality": quality
        ]
        return try await postRequest(endpoint: "/api/instant-style", body: body)
    }

    func headshot(image: UIImage, background: String, quality: String = "hd") async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "background": background,
            "quality": quality
        ]
        return try await postRequest(endpoint: "/api/headshot", body: body, requiresAuth: quality == "hd")
    }

    func hairChange(image: UIImage, prompt: String, quality: String = "standard") async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "prompt": prompt,
            "quality": quality
        ]
        return try await postRequest(endpoint: "/api/hair-change", body: body)
    }

    func relight(image: UIImage, prompt: String, direction: String, quality: String = "standard") async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "prompt": prompt,
            "direction": direction,
            "quality": quality
        ]
        return try await postRequest(endpoint: "/api/relight", body: body)
    }

    func ageTransform(image: UIImage, targetAge: Int, quality: String = "standard") async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "target_age": targetAge,
            "quality": quality
        ]
        return try await postRequest(endpoint: "/api/age-transform", body: body)
    }

    func tryOn(humanImage: UIImage, garmentImage: UIImage, garmentType: String) async throws -> UIImage {
        let body: [String: Any] = [
            "human_image": try encodeImage(humanImage),
            "garment_image": try encodeImage(garmentImage),
            "garment_type": garmentType
        ]
        return try await postRequest(endpoint: "/api/try-on", body: body, requiresAuth: true)
    }

    // MARK: - Video Features (return URL, not UIImage)

    func animatePortrait(image: UIImage, drivingVideoURL: URL) async throws -> URL {
        let videoData = try Data(contentsOf: drivingVideoURL)
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "video": videoData.base64EncodedString()
        ]
        return try await postVideoRequest(endpoint: "/api/animate-portrait", body: body, requiresAuth: true)
    }

    func talkingPhoto(sourceVideoURL: URL, audioURL: URL) async throws -> URL {
        let videoData = try Data(contentsOf: sourceVideoURL)
        let audioData = try Data(contentsOf: audioURL)
        let body: [String: Any] = [
            "source_video": videoData.base64EncodedString(),
            "audio": audioData.base64EncodedString()
        ]
        return try await postVideoRequest(endpoint: "/api/talking-photo", body: body, requiresAuth: true)
    }

    func backgroundRemoval(image: UIImage) async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "model": "Portrait",
            "output_format": "png"
        ]
        return try await postRequest(endpoint: "/api/background-removal", body: body)
    }

    func caricature(image: UIImage) async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image)
        ]
        return try await postRequest(endpoint: "/api/caricature", body: body)
    }

    func photoRestore(image: UIImage, fixColors: Bool = true, removeScratches: Bool = true, enhanceResolution: Bool = true) async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "fix_colors": fixColors,
            "remove_scratches": removeScratches,
            "enhance_resolution": enhanceResolution
        ]
        return try await postRequest(endpoint: "/api/photo-restore", body: body)
    }

    func petPortrait(image: UIImage, style: String) async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "style": style
        ]
        return try await postRequest(endpoint: "/api/pet-portrait", body: body)
    }

    func fitnessTransform(image: UIImage, intensity: String = "moderate") async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image),
            "intensity": intensity
        ]
        return try await postRequest(endpoint: "/api/fitness-transform", body: body)
    }

    func upscale(image: UIImage) async throws -> UIImage {
        let body: [String: Any] = [
            "image": try encodeImage(image)
        ]
        return try await postRequest(endpoint: "/api/upscale", body: body)
    }

    // MARK: - Private Helpers

    private func encodeImage(_ image: UIImage) throws -> String {
        guard let data = image.jpegData(compressionQuality: 0.85) else {
            throw FeatureError.encodingFailed
        }
        return data.base64EncodedString()
    }

    private func postRequest(endpoint: String, body: [String: Any], requiresAuth: Bool = false) async throws -> UIImage {
        guard let url = URL(string: Configuration.workerBaseURL + endpoint) else {
            throw FeatureError.apiError("Invalid server configuration")
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Attach subscriber token for premium/HD features
        if requiresAuth, let token = SubscriptionManager.shared.subscriberToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw FeatureError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200:
            guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let imageURLString = json["image_url"] as? String,
                  let imageURL = URL(string: imageURLString) else {
                throw FeatureError.invalidResponse
            }

            let (imageData, _) = try await session.data(from: imageURL)
            guard let resultImage = UIImage(data: imageData) else {
                throw FeatureError.invalidResponse
            }
            return resultImage

        default:
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw FeatureError.apiError(errorMessage)
        }
    }

    /// POST request that returns a video URL (for animate portrait, talking photo)
    private func postVideoRequest(endpoint: String, body: [String: Any], requiresAuth: Bool = false) async throws -> URL {
        guard let url = URL(string: Configuration.workerBaseURL + endpoint) else {
            throw FeatureError.apiError("Invalid server configuration")
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 120 // Video processing takes longer

        if requiresAuth, let token = SubscriptionManager.shared.subscriberToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw FeatureError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200:
            guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let videoURLString = json["video_url"] as? String,
                  let videoURL = URL(string: videoURLString) else {
                throw FeatureError.invalidResponse
            }
            return videoURL

        default:
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw FeatureError.apiError(errorMessage)
        }
    }
}
