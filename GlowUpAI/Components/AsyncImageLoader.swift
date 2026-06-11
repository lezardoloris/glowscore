import SwiftUI

struct LocalImageView: View {
    let path: String
    var contentMode: ContentMode = .fill

    var body: some View {
        if let uiImage = UIImage(contentsOfFile: path) {
            Image(uiImage: uiImage)
                .resizable()
                .aspectRatio(contentMode: contentMode)
        } else {
            Rectangle()
                .fill(Color.cardBackground)
                .overlay(
                    Image(systemName: "photo")
                        .foregroundStyle(.subtleText)
                )
        }
    }
}
