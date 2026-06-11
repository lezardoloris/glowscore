import Vision
import UIKit
import CoreImage

final class FaceDetectionService {
    enum FaceDetectionError: LocalizedError {
        case noFaceDetected
        case multipleFacesDetected
        case imageProcessingFailed
        case lowConfidence(Float)

        var errorDescription: String? {
            switch self {
            case .noFaceDetected: return "No face detected. Please try a clearer photo with good lighting."
            case .multipleFacesDetected: return "Multiple faces detected. Please use a photo with one face."
            case .imageProcessingFailed: return "Could not process the image. Please try again."
            case .lowConfidence(let score): return "Face detection confidence is low (\(Int(score * 100))%). Try a clearer, well-lit photo for better results."
            }
        }
    }

    /// Result of face detection including the cropped image and any warnings
    struct FaceDetectionResult {
        let image: UIImage
        let lowConfidence: Bool
        let confidence: Float
    }

    // M9: Confidence threshold — below this we warn but still proceed
    private let confidenceWarningThreshold: Float = 0.5

    /// Legacy convenience method — delegates to detectFace and returns just the image
    func detectAndCropFace(from image: UIImage, targetSize: CGFloat = 1024) async throws -> UIImage {
        let result = try await detectFace(from: image, targetSize: targetSize)
        return result.image
    }

    /// Full detection returning image + confidence warning flag
    func detectFace(from image: UIImage, targetSize: CGFloat = 1024) async throws -> FaceDetectionResult {
        guard let cgImage = image.cgImage else {
            throw FaceDetectionError.imageProcessingFailed
        }

        let request = VNDetectFaceRectanglesRequest()
        // C3 FIX: Use actual image orientation instead of hardcoded .up
        let cgOrientation = CGImagePropertyOrientation(image.imageOrientation)
        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: cgOrientation, options: [:])

        // H6 FIX: Run Vision on background thread to avoid blocking main thread
        try await Task.detached {
            try handler.perform([request])
        }.value

        guard let results = request.results, !results.isEmpty else {
            throw FaceDetectionError.noFaceDetected
        }

        // For MVP, use the largest face if multiple detected
        let face = results.max(by: { $0.boundingBox.width * $0.boundingBox.height < $1.boundingBox.width * $1.boundingBox.height })!

        // M9 FIX: Track confidence for warning flag
        let isLowConfidence = face.confidence < confidenceWarningThreshold
        if isLowConfidence {
            print("[FaceDetection] Low confidence: \(face.confidence). Proceeding but quality may be poor.")
        }

        let boundingBox = face.boundingBox

        // Expand bounding box to include head/hair/neck (1.8x)
        let imageWidth = CGFloat(cgImage.width)
        let imageHeight = CGFloat(cgImage.height)

        let faceRect = CGRect(
            x: boundingBox.origin.x * imageWidth,
            y: (1 - boundingBox.origin.y - boundingBox.height) * imageHeight,
            width: boundingBox.width * imageWidth,
            height: boundingBox.height * imageHeight
        )

        // Expand to 1.8x for head room, then make square
        let expandFactor: CGFloat = 1.8
        let expandedWidth = faceRect.width * expandFactor
        let expandedHeight = faceRect.height * expandFactor
        let squareSize = max(expandedWidth, expandedHeight)
        let squareX = faceRect.midX - squareSize / 2
        let squareY = faceRect.midY - squareSize / 2

        // Clamp to image bounds
        let cropRect = CGRect(
            x: max(0, squareX),
            y: max(0, squareY),
            width: min(squareSize, imageWidth - max(0, squareX)),
            height: min(squareSize, imageHeight - max(0, squareY))
        ).integral

        guard let croppedCGImage = cgImage.cropping(to: cropRect) else {
            throw FaceDetectionError.imageProcessingFailed
        }

        // Resize to target size
        let croppedImage = UIImage(cgImage: croppedCGImage)
        let resizedImage = resize(croppedImage, to: CGSize(width: targetSize, height: targetSize))
        return FaceDetectionResult(
            image: resizedImage,
            lowConfidence: isLowConfidence,
            confidence: face.confidence
        )
    }

    private func resize(_ image: UIImage, to size: CGSize) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }
}

// C3: Map UIImage orientation to CGImagePropertyOrientation for Vision
extension CGImagePropertyOrientation {
    init(_ uiOrientation: UIImage.Orientation) {
        switch uiOrientation {
        case .up: self = .up
        case .upMirrored: self = .upMirrored
        case .down: self = .down
        case .downMirrored: self = .downMirrored
        case .left: self = .left
        case .leftMirrored: self = .leftMirrored
        case .right: self = .right
        case .rightMirrored: self = .rightMirrored
        @unknown default: self = .up
        }
    }
}
