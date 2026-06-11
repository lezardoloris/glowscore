import SwiftUI

struct BeforeAfterSlider: View {
    let beforeImage: UIImage
    let afterImage: UIImage

    @State private var sliderPosition: CGFloat = 0.5
    @GestureState private var isDragging = false

    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            let dividerX = width * sliderPosition

            ZStack {
                // After image (full background)
                Image(uiImage: afterImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: width, height: height)
                    .clipped()

                // Before image (clipped to left side)
                Image(uiImage: beforeImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: width, height: height)
                    .clipped()
                    .clipShape(
                        HorizontalClipShape(splitAt: sliderPosition)
                    )

                // Divider line
                Rectangle()
                    .fill(.white)
                    .frame(width: 2, height: height)
                    .position(x: dividerX, y: height / 2)
                    .shadow(color: .black.opacity(0.3), radius: 4)

                // Handle
                Circle()
                    .fill(.white)
                    .frame(width: 40, height: 40)
                    .overlay(
                        HStack(spacing: 2) {
                            Image(systemName: "chevron.left")
                                .font(.caption2.bold())
                            Image(systemName: "chevron.right")
                                .font(.caption2.bold())
                        }
                        .foregroundStyle(.black)
                    )
                    .shadow(color: .black.opacity(0.3), radius: 6)
                    .scaleEffect(isDragging ? 1.1 : 1.0)
                    .position(x: dividerX, y: height / 2)

                // Labels
                VStack {
                    HStack {
                        Text("BEFORE")
                            .font(.caption2.bold())
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.black.opacity(0.5))
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                            .padding(12)
                            .opacity(sliderPosition > 0.15 ? 1 : 0)

                        Spacer()

                        Text("AFTER")
                            .font(.caption2.bold())
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.black.opacity(0.5))
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                            .padding(12)
                            .opacity(sliderPosition < 0.85 ? 1 : 0)
                    }
                    Spacer()
                }

                // Watermark removed — no watermarks in new monetization model
            }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .updating($isDragging) { _, state, _ in
                        state = true
                    }
                    .onChanged { value in
                        sliderPosition = min(max(value.location.x / width, 0.02), 0.98)
                    }
            )
        }
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
}

struct HorizontalClipShape: Shape {
    let splitAt: CGFloat

    func path(in rect: CGRect) -> Path {
        Path(CGRect(
            x: 0,
            y: 0,
            width: rect.width * splitAt,
            height: rect.height
        ))
    }
}
