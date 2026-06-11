import CoreImage
import UIKit

/// On-device beauty filter engine using CIFilter chains.
/// No network calls — all processing happens locally via Core Image.
final class BeautyFilterEngine {

    private let ciContext = CIContextProvider.shared.context

    // MARK: - Presets

    struct Preset {
        let name: String
        let smoothing: Float
        let brightness: Float
        let contrast: Float
        let saturation: Float
        let warmth: Float
        let sharpen: Float
    }

    static let presets: [Preset] = [
        Preset(name: "Natural",  smoothing: 20, brightness: 5,   contrast: 5,   saturation: 10,  warmth: 10,  sharpen: 15),
        Preset(name: "Glam",     smoothing: 40, brightness: 10,  contrast: 15,  saturation: 20,  warmth: 15,  sharpen: 20),
        Preset(name: "Soft",     smoothing: 60, brightness: 15,  contrast: -5,  saturation: -10, warmth: 20,  sharpen: 0),
        Preset(name: "Dramatic", smoothing: 10, brightness: -5,  contrast: 30,  saturation: 15,  warmth: -10, sharpen: 25),
        Preset(name: "Cool",     smoothing: 30, brightness: 5,   contrast: 10,  saturation: -15, warmth: -20, sharpen: 15),
    ]

    // MARK: - Filter Application

    /// Apply the full beauty filter chain to a CIImage.
    ///
    /// All slider values are on a 0–100 scale (or -100 to 100 for contrast/saturation/warmth).
    /// Internally they are mapped to the ranges each CIFilter expects.
    func applyFilter(
        to image: CIImage,
        smoothing: Float,
        brightness: Float,
        contrast: Float,
        saturation: Float,
        warmth: Float,
        sharpen: Float
    ) -> CIImage {
        var output = image

        // 1. Skin Smoothing — CIGaussianBlur
        if smoothing > 0 {
            let radius = Double(smoothing) / 100.0 * 10.0 // 0–10 pt radius
            if let blur = CIFilter(name: "CIGaussianBlur") {
                blur.setValue(output, forKey: kCIInputImageKey)
                blur.setValue(radius, forKey: kCIInputRadiusKey)
                if let blurred = blur.outputImage {
                    // Crop to original extent (blur expands edges)
                    output = blurred.cropped(to: image.extent)
                }
            }
        }

        // 2. Brightness / Contrast / Saturation — CIColorControls
        if let colorControls = CIFilter(name: "CIColorControls") {
            colorControls.setValue(output, forKey: kCIInputImageKey)
            colorControls.setValue(Double(brightness) / 100.0 * 0.3, forKey: kCIInputBrightnessKey)      // -0.3 … 0.3
            colorControls.setValue(1.0 + Double(contrast) / 100.0 * 0.5, forKey: kCIInputContrastKey)    // 0.5 … 1.5
            colorControls.setValue(1.0 + Double(saturation) / 100.0 * 0.5, forKey: kCIInputSaturationKey) // 0.5 … 1.5
            if let result = colorControls.outputImage {
                output = result
            }
        }

        // 3. Warmth — CITemperatureAndTint
        if let tempTint = CIFilter(name: "CITemperatureAndTint") {
            tempTint.setValue(output, forKey: kCIInputImageKey)
            let neutralTemp: Double = 6500
            let tempShift = Double(warmth) / 100.0 * 2000 // -2000 … +2000
            tempTint.setValue(CIVector(x: CGFloat(neutralTemp + tempShift), y: 0), forKey: "inputNeutral")
            if let result = tempTint.outputImage {
                output = result
            }
        }

        // 4. Sharpen — CISharpenLuminance
        if sharpen > 0 {
            if let sharp = CIFilter(name: "CISharpenLuminance") {
                sharp.setValue(output, forKey: kCIInputImageKey)
                sharp.setValue(Double(sharpen) / 100.0 * 2.0, forKey: kCIInputSharpnessKey) // 0–2
                if let result = sharp.outputImage {
                    output = result
                }
            }
        }

        return output
    }

    /// Convenience: render a CIImage to UIImage.
    func renderToUIImage(_ ciImage: CIImage) -> UIImage? {
        guard let cgImage = ciContext.createCGImage(ciImage, from: ciImage.extent) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}
