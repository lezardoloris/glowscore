import SwiftUI
import UIKit

struct ShareSheet: View {
    let originalImage: UIImage
    let transformedImage: UIImage
    let styleName: String

    @Environment(\.dismiss) var dismiss
    @State private var shareImage: UIImage?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                VStack(spacing: 24) {
                    Text("Share Your Glow Up")
                        .font(.title2.bold())
                        .foregroundStyle(.white)

                    // Preview of share image
                    if let shareImage {
                        Image(uiImage: shareImage)
                            .resizable()
                            .scaledToFit()
                            .frame(maxHeight: 400)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }

                    // Share buttons
                    HStack(spacing: 20) {
                        ShareButton(icon: "camera.fill", label: "Stories", color: .purple) {
                            shareToInstagramStories()
                        }
                        ShareButton(icon: "play.rectangle.fill", label: "TikTok", color: .pink) {
                            shareGeneric()
                        }
                        ShareButton(icon: "square.and.arrow.down", label: "Save", color: .blue) {
                            saveToPhotos()
                        }
                        ShareButton(icon: "ellipsis", label: "More", color: .gray) {
                            shareGeneric()
                        }
                    }
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(.white)
                }
            }
        }
        .onAppear {
            shareImage = generateShareImage()
        }
    }

    private func generateShareImage() -> UIImage {
        let width: CGFloat = 1080
        let height: CGFloat = 1920 // 9:16 for Stories
        let imgW = width / 2 - 24
        let imgH = imgW
        let cornerRadius: CGFloat = 16

        let renderer = UIGraphicsImageRenderer(size: CGSize(width: width, height: height))
        return renderer.image { ctx in
            let gc = ctx.cgContext

            // Background gradient: dark purple to midnight
            let gradientColors = [
                UIColor(red: 0.12, green: 0.02, blue: 0.22, alpha: 1).cgColor,  // dark purple
                UIColor(red: 0.04, green: 0.01, blue: 0.10, alpha: 1).cgColor   // midnight
            ]
            let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: gradientColors as CFArray, locations: [0, 1])!
            gc.drawLinearGradient(gradient, start: .zero, end: CGPoint(x: 0, y: height), options: [])

            // Subtle top-center glow
            let glowCenter = CGPoint(x: width / 2, y: height * 0.35)
            let glowColors = [
                UIColor(red: 0.93, green: 0.27, blue: 0.60, alpha: 0.12).cgColor,  // pink hint
                UIColor.clear.cgColor
            ]
            if let glowGrad = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: glowColors as CFArray, locations: [0, 1]) {
                gc.drawRadialGradient(glowGrad, startCenter: glowCenter, startRadius: 0, endCenter: glowCenter, endRadius: width * 0.6, options: [])
            }

            // Title
            let titleAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 48, weight: .bold),
                .foregroundColor: UIColor.white
            ]
            let titleString = "My Glow Up ✨"
            let titleSize = (titleString as NSString).size(withAttributes: titleAttrs)
            titleString.draw(at: CGPoint(x: (width - titleSize.width) / 2, y: 120), withAttributes: titleAttrs)

            // Separator line (pink to purple gradient)
            let lineY: CGFloat = 190
            let lineGrad = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(),
                colors: [UIColor(red: 0.93, green: 0.27, blue: 0.60, alpha: 1).cgColor,
                         UIColor(red: 0.66, green: 0.33, blue: 0.97, alpha: 1).cgColor] as CFArray, locations: [0, 1])!
            gc.saveGState()
            gc.addRect(CGRect(x: width * 0.2, y: lineY, width: width * 0.6, height: 3))
            gc.clip()
            gc.drawLinearGradient(lineGrad, start: CGPoint(x: width * 0.2, y: lineY), end: CGPoint(x: width * 0.8, y: lineY), options: [])
            gc.restoreGState()

            // "BEFORE" / "AFTER" labels
            let leftX: CGFloat = 16
            let rightX = width / 2 + 8
            let labelsY: CGFloat = 250

            let labelAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 20, weight: .bold),
                .foregroundColor: UIColor.white.withAlphaComponent(0.8)
            ]
            let beforeSize = ("BEFORE" as NSString).size(withAttributes: labelAttrs)
            let afterSize = ("AFTER" as NSString).size(withAttributes: labelAttrs)
            "BEFORE".draw(at: CGPoint(x: leftX + (imgW - beforeSize.width) / 2, y: labelsY), withAttributes: labelAttrs)
            "AFTER".draw(at: CGPoint(x: rightX + (imgW - afterSize.width) / 2, y: labelsY), withAttributes: labelAttrs)

            // Before/after images side by side with rounded corners
            let imageY: CGFloat = 290

            func drawRoundedImage(_ image: UIImage, in rect: CGRect) {
                gc.saveGState()
                let path = UIBezierPath(roundedRect: rect, cornerRadius: cornerRadius)
                gc.addPath(path.cgPath)
                gc.clip()
                image.draw(in: rect)
                gc.restoreGState()
            }

            let beforeRect = CGRect(x: leftX, y: imageY, width: imgW, height: imgH)
            let afterRect = CGRect(x: rightX, y: imageY, width: imgW, height: imgH)
            drawRoundedImage(originalImage, in: beforeRect)
            drawRoundedImage(transformedImage, in: afterRect)

            // Style name badge below the images
            let badgeY = imageY + imgH + 28
            let badgeText = styleName
            let badgeAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 26, weight: .semibold),
                .foregroundColor: UIColor.white
            ]
            let badgeSize = (badgeText as NSString).size(withAttributes: badgeAttrs)
            let badgePadH: CGFloat = 24
            let badgePadV: CGFloat = 10
            let badgeW = badgeSize.width + badgePadH * 2
            let badgeH = badgeSize.height + badgePadV * 2
            let badgeX = (width - badgeW) / 2

            // Badge background (pill shape with purple fill)
            let badgeRect = CGRect(x: badgeX, y: badgeY, width: badgeW, height: badgeH)
            gc.saveGState()
            let badgePath = UIBezierPath(roundedRect: badgeRect, cornerRadius: badgeH / 2)
            UIColor(red: 0.66, green: 0.33, blue: 0.97, alpha: 0.3).setFill()
            badgePath.fill()
            UIColor(red: 0.66, green: 0.33, blue: 0.97, alpha: 0.6).setStroke()
            badgePath.lineWidth = 1.5
            badgePath.stroke()
            gc.restoreGState()

            badgeText.draw(at: CGPoint(x: badgeX + badgePadH, y: badgeY + badgePadV), withAttributes: badgeAttrs)

            // Branded footer text
            let brandAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 24, weight: .medium),
                .foregroundColor: UIColor.white.withAlphaComponent(0.45)
            ]
            let brandText = "Made with GlowUp AI"
            let brandSize = (brandText as NSString).size(withAttributes: brandAttrs)
            brandText.draw(at: CGPoint(x: (width - brandSize.width) / 2, y: height - 100), withAttributes: brandAttrs)

            let subAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 16, weight: .regular),
                .foregroundColor: UIColor.white.withAlphaComponent(0.3)
            ]
            let subText = "See your best self in 30 seconds"
            let subSize = (subText as NSString).size(withAttributes: subAttrs)
            subText.draw(at: CGPoint(x: (width - subSize.width) / 2, y: height - 68), withAttributes: subAttrs)
        }
    }

    private func shareToInstagramStories() {
        guard let shareImage,
              let imageData = shareImage.pngData() else { return }

        let pasteboardItems: [[String: Any]] = [
            ["com.instagram.sharedSticker.backgroundImage": imageData]
        ]
        let pasteboardOptions: [UIPasteboard.OptionsKey: Any] = [
            .expirationDate: Date().addingTimeInterval(60 * 5)
        ]
        UIPasteboard.general.setItems(pasteboardItems, options: pasteboardOptions)

        if let url = URL(string: "instagram-stories://share") {
            UIApplication.shared.open(url)
        }
    }

    private func saveToPhotos() {
        guard let shareImage else { return }
        UIImageWriteToSavedPhotosAlbum(shareImage, nil, nil, nil)
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    private func shareGeneric() {
        guard let shareImage else { return }
        let activityVC = UIActivityViewController(activityItems: [shareImage, "See my glow up! Made with GlowUp AI"], applicationActivities: nil)
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootVC = windowScene.windows.first?.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }
}

struct ShareButton: View {
    let icon: String
    let label: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .frame(width: 56, height: 56)
                    .background(color.opacity(0.2))
                    .clipShape(Circle())
                Text(label)
                    .font(.caption2)
            }
            .foregroundStyle(.white)
        }
    }
}
