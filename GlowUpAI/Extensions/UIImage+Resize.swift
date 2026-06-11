import UIKit

extension UIImage {
    func resized(maxDimension: CGFloat) -> UIImage {
        let aspectRatio = size.width / size.height
        var newSize: CGSize

        if size.width > size.height {
            newSize = CGSize(width: maxDimension, height: maxDimension / aspectRatio)
        } else {
            newSize = CGSize(width: maxDimension * aspectRatio, height: maxDimension)
        }

        // Don't upscale
        if newSize.width >= size.width && newSize.height >= size.height {
            return self
        }

        let renderer = UIGraphicsImageRenderer(size: newSize)
        return renderer.image { _ in
            draw(in: CGRect(origin: .zero, size: newSize))
        }
    }

    func croppedToFace(faceRect: CGRect, padding: CGFloat = 0.3) -> UIImage {
        let paddedRect = faceRect.insetBy(
            dx: -faceRect.width * padding,
            dy: -faceRect.height * padding
        )

        let clampedRect = CGRect(
            x: max(0, paddedRect.origin.x),
            y: max(0, paddedRect.origin.y),
            width: min(paddedRect.width, size.width - max(0, paddedRect.origin.x)),
            height: min(paddedRect.height, size.height - max(0, paddedRect.origin.y))
        )

        guard let cgImage = cgImage?.cropping(to: clampedRect) else { return self }
        return UIImage(cgImage: cgImage, scale: scale, orientation: imageOrientation)
    }

    // v1.2: Watermark removed — no watermarks in new monetization model
}
