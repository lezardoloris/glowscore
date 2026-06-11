import UIKit
import Vision
import CoreImage

// MARK: - Configuration

struct MakeupConfig {
    var lipColor: UIColor
    var lipOpacity: Float
    var eyeShadowColor: UIColor
    var eyeShadowOpacity: Float
    var blushColor: UIColor
    var blushOpacity: Float
    var eyelinerEnabled: Bool
    var eyelinerThickness: Float // 1–5 pt

    static let none = MakeupConfig(
        lipColor: .clear, lipOpacity: 0,
        eyeShadowColor: .clear, eyeShadowOpacity: 0,
        blushColor: .clear, blushOpacity: 0,
        eyelinerEnabled: false, eyelinerThickness: 1
    )
}

// MARK: - Preset Looks

struct MakeupPreset {
    let name: String
    let config: MakeupConfig
}

extension MakeupPreset {
    static let presets: [MakeupPreset] = [
        MakeupPreset(name: "Natural Day", config: MakeupConfig(
            lipColor: UIColor(red: 0.85, green: 0.55, blue: 0.50, alpha: 1), lipOpacity: 0.35,
            eyeShadowColor: UIColor(red: 0.85, green: 0.72, blue: 0.53, alpha: 1), eyeShadowOpacity: 0.20,
            blushColor: UIColor(red: 1.0, green: 0.70, blue: 0.65, alpha: 1), blushOpacity: 0.20,
            eyelinerEnabled: false, eyelinerThickness: 1
        )),
        MakeupPreset(name: "Date Night", config: MakeupConfig(
            lipColor: UIColor(red: 0.75, green: 0.15, blue: 0.20, alpha: 1), lipOpacity: 0.55,
            eyeShadowColor: UIColor(red: 0.55, green: 0.35, blue: 0.20, alpha: 1), eyeShadowOpacity: 0.40,
            blushColor: UIColor(red: 0.95, green: 0.55, blue: 0.55, alpha: 1), blushOpacity: 0.30,
            eyelinerEnabled: true, eyelinerThickness: 2
        )),
        MakeupPreset(name: "Glam", config: MakeupConfig(
            lipColor: UIColor(red: 0.80, green: 0.10, blue: 0.15, alpha: 1), lipOpacity: 0.70,
            eyeShadowColor: UIColor(red: 0.85, green: 0.72, blue: 0.53, alpha: 1), eyeShadowOpacity: 0.55,
            blushColor: UIColor(red: 1.0, green: 0.50, blue: 0.55, alpha: 1), blushOpacity: 0.40,
            eyelinerEnabled: true, eyelinerThickness: 3
        )),
        MakeupPreset(name: "Bold", config: MakeupConfig(
            lipColor: UIColor(red: 0.60, green: 0.05, blue: 0.25, alpha: 1), lipOpacity: 0.80,
            eyeShadowColor: UIColor(red: 0.35, green: 0.15, blue: 0.50, alpha: 1), eyeShadowOpacity: 0.60,
            blushColor: UIColor(red: 0.95, green: 0.40, blue: 0.50, alpha: 1), blushOpacity: 0.45,
            eyelinerEnabled: true, eyelinerThickness: 4
        )),
        MakeupPreset(name: "Minimal", config: MakeupConfig(
            lipColor: UIColor(red: 0.88, green: 0.65, blue: 0.58, alpha: 1), lipOpacity: 0.25,
            eyeShadowColor: .clear, eyeShadowOpacity: 0,
            blushColor: UIColor(red: 1.0, green: 0.75, blue: 0.70, alpha: 1), blushOpacity: 0.15,
            eyelinerEnabled: false, eyelinerThickness: 1
        )),
    ]
}

// MARK: - Engine

final class MakeupEngine {

    private let ciContext = CIContextProvider.shared.context

    /// Apply virtual makeup to a photo using Vision face landmarks + Core Graphics overlay.
    func applyMakeup(to image: UIImage, config: MakeupConfig) async -> UIImage {
        guard let cgImage = image.cgImage else { return image }

        // Detect face landmarks
        let request = VNDetectFaceLandmarksRequest()
        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: CGImagePropertyOrientation(image.imageOrientation), options: [:])

        do {
            try await Task.detached {
                try handler.perform([request])
            }.value
        } catch {
            print("[MakeupEngine] Face landmark detection failed: \(error)")
            return image
        }

        guard let face = request.results?.first else {
            print("[MakeupEngine] No face found")
            return image
        }

        let imageSize = CGSize(width: cgImage.width, height: cgImage.height)

        // Draw makeup overlay
        let renderer = UIGraphicsImageRenderer(size: imageSize)
        let overlayImage = renderer.image { ctx in
            let gc = ctx.cgContext

            let boundingBox = face.boundingBox
            let faceRect = CGRect(
                x: boundingBox.origin.x * imageSize.width,
                y: (1 - boundingBox.origin.y - boundingBox.height) * imageSize.height,
                width: boundingBox.width * imageSize.width,
                height: boundingBox.height * imageSize.height
            )

            // --- Lips ---
            if config.lipOpacity > 0, let landmarks = face.landmarks {
                if let outerLips = landmarks.outerLips {
                    let points = self.landmarkPoints(outerLips, in: boundingBox, imageSize: imageSize)
                    self.fillRegion(points: points, color: config.lipColor, opacity: config.lipOpacity, in: gc)
                }
                if let innerLips = landmarks.innerLips {
                    // Slightly darken inner lips for depth
                    let points = self.landmarkPoints(innerLips, in: boundingBox, imageSize: imageSize)
                    let darkerLip = config.lipColor.withAlphaComponent(CGFloat(config.lipOpacity) * 0.6)
                    self.fillRegion(points: points, color: darkerLip, opacity: 1.0, in: gc)
                }
            }

            // --- Eye Shadow ---
            if config.eyeShadowOpacity > 0, let landmarks = face.landmarks {
                for eyeLandmark in [landmarks.leftEye, landmarks.rightEye] {
                    guard let eye = eyeLandmark else { continue }
                    let points = self.landmarkPoints(eye, in: boundingBox, imageSize: imageSize)
                    let shiftedPoints = self.shiftedAboveEye(points: points, offset: faceRect.height * 0.04)
                    self.fillRegion(points: shiftedPoints, color: config.eyeShadowColor, opacity: config.eyeShadowOpacity, in: gc)
                }
            }

            // --- Eyeliner ---
            if config.eyelinerEnabled, let landmarks = face.landmarks {
                for eyeLandmark in [landmarks.leftEye, landmarks.rightEye] {
                    guard let eye = eyeLandmark else { continue }
                    let points = self.landmarkPoints(eye, in: boundingBox, imageSize: imageSize)
                    // Draw along the upper half of the eye contour
                    let upperPoints = self.upperContour(of: points)
                    self.strokePath(points: upperPoints, color: .black, lineWidth: CGFloat(config.eyelinerThickness), in: gc)
                }
            }

            // --- Blush ---
            if config.blushOpacity > 0 {
                let leftCheekCenter = CGPoint(
                    x: faceRect.origin.x + faceRect.width * 0.22,
                    y: faceRect.origin.y + faceRect.height * 0.62
                )
                let rightCheekCenter = CGPoint(
                    x: faceRect.origin.x + faceRect.width * 0.78,
                    y: faceRect.origin.y + faceRect.height * 0.62
                )
                let blushRadius = faceRect.width * 0.14
                for center in [leftCheekCenter, rightCheekCenter] {
                    self.drawBlush(center: center, radius: blushRadius, color: config.blushColor, opacity: config.blushOpacity, in: gc)
                }
            }
        }

        // Soften the overlay with a gaussian blur for natural edges
        let softOverlay = softenOverlay(overlayImage)

        // Composite original + softened overlay
        let composited = renderer.image { ctx in
            image.draw(in: CGRect(origin: .zero, size: imageSize))
            softOverlay.draw(in: CGRect(origin: .zero, size: imageSize), blendMode: .multiply, alpha: 1.0)
        }

        return composited
    }

    // MARK: - Helpers

    private func landmarkPoints(_ landmark: VNFaceLandmarkRegion2D, in boundingBox: CGRect, imageSize: CGSize) -> [CGPoint] {
        let pointCount = landmark.pointCount
        let points = landmark.normalizedPoints
        return (0..<pointCount).map { i in
            let pt = points[i]
            return CGPoint(
                x: (boundingBox.origin.x + pt.x * boundingBox.width) * imageSize.width,
                y: (1 - (boundingBox.origin.y + pt.y * boundingBox.height)) * imageSize.height
            )
        }
    }

    private func fillRegion(points: [CGPoint], color: UIColor, opacity: Float, in gc: CGContext) {
        guard points.count >= 3 else { return }
        gc.saveGState()
        gc.setFillColor(color.withAlphaComponent(CGFloat(opacity)).cgColor)
        gc.setBlendMode(.normal)
        gc.beginPath()
        gc.move(to: points[0])
        for pt in points.dropFirst() { gc.addLine(to: pt) }
        gc.closePath()
        gc.fillPath()
        gc.restoreGState()
    }

    private func strokePath(points: [CGPoint], color: UIColor, lineWidth: CGFloat, in gc: CGContext) {
        guard points.count >= 2 else { return }
        gc.saveGState()
        gc.setStrokeColor(color.cgColor)
        gc.setLineWidth(lineWidth)
        gc.setLineCap(.round)
        gc.setLineJoin(.round)
        gc.beginPath()
        gc.move(to: points[0])
        for pt in points.dropFirst() { gc.addLine(to: pt) }
        gc.strokePath()
        gc.restoreGState()
    }

    private func drawBlush(center: CGPoint, radius: CGFloat, color: UIColor, opacity: Float, in gc: CGContext) {
        gc.saveGState()
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        color.getRed(&r, green: &g, blue: &b, alpha: &a)
        let colors = [
            UIColor(red: r, green: g, blue: b, alpha: CGFloat(opacity)).cgColor,
            UIColor(red: r, green: g, blue: b, alpha: 0).cgColor
        ] as CFArray
        if let gradient = CGGradient(colorsSpace: colorSpace, colors: colors, locations: [0, 1]) {
            gc.drawRadialGradient(gradient, startCenter: center, startRadius: 0, endCenter: center, endRadius: radius, options: [])
        }
        gc.restoreGState()
    }

    private func shiftedAboveEye(points: [CGPoint], offset: CGFloat) -> [CGPoint] {
        // Move points upward (lower Y in UIKit coords drawn flipped, but we're in image coords where Y goes down)
        points.map { CGPoint(x: $0.x, y: $0.y - offset) }
    }

    private func upperContour(of points: [CGPoint]) -> [CGPoint] {
        guard points.count >= 4 else { return points }
        // Upper half: take the upper portion of the eye contour (lower Y values = higher on screen)
        let midY = points.map(\.y).reduce(0, +) / CGFloat(points.count)
        let upper = points.filter { $0.y <= midY }
        return upper.sorted(by: { $0.x < $1.x })
    }

    private func softenOverlay(_ overlay: UIImage) -> UIImage {
        guard let ciImage = CIImage(image: overlay) else { return overlay }
        guard let blur = CIFilter(name: "CIGaussianBlur") else { return overlay }
        blur.setValue(ciImage, forKey: kCIInputImageKey)
        blur.setValue(4.0, forKey: kCIInputRadiusKey)
        guard let output = blur.outputImage else { return overlay }
        let cropped = output.cropped(to: ciImage.extent)
        guard let cgImage = ciContext.createCGImage(cropped, from: cropped.extent) else { return overlay }
        return UIImage(cgImage: cgImage)
    }
}
