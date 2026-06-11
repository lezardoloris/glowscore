import SwiftUI

struct FeatureResultView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    let originalImage: UIImage
    let transformedImage: UIImage
    let featureType: String

    @State private var sliderPosition: CGFloat = 0.5
    @State private var showShareSheet = false
    @State private var revealComplete = false

    private var featureDisplayName: String {
        switch featureType {
        case "face_swap": return "Face Swap"
        case "instant_style": return "Art Style"
        case "headshot": return "AI Headshot"
        case "hair_change": return "Hair Change"
        case "relight": return "Relight"
        case "age_transform": return "Age Transform"
        case "try_on": return "Try-On"
        default: return "Result"
        }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 20) {
                // Before/After Slider (reuses ResultView pattern)
                GeometryReader { geo in
                    ZStack {
                        Image(uiImage: transformedImage)
                            .resizable()
                            .scaledToFill()
                            .frame(width: geo.size.width, height: geo.size.width)
                            .clipped()

                        Image(uiImage: originalImage)
                            .resizable()
                            .scaledToFill()
                            .frame(width: geo.size.width, height: geo.size.width)
                            .clipped()
                            .mask(
                                HStack(spacing: 0) {
                                    Rectangle()
                                        .frame(width: geo.size.width * sliderPosition)
                                    Spacer(minLength: 0)
                                }
                            )

                        // Slider handle
                        Rectangle()
                            .fill(.white)
                            .frame(width: 3, height: geo.size.width)
                            .shadow(color: .black.opacity(0.5), radius: 4)
                            .overlay(
                                Circle()
                                    .fill(.white)
                                    .frame(width: 36, height: 36)
                                    .shadow(color: .black.opacity(0.3), radius: 4)
                                    .overlay(
                                        HStack(spacing: 2) {
                                            Image(systemName: "chevron.left")
                                                .font(.system(size: 10, weight: .bold))
                                            Image(systemName: "chevron.right")
                                                .font(.system(size: 10, weight: .bold))
                                        }
                                        .foregroundStyle(.gray)
                                    )
                            )
                            .position(x: geo.size.width * sliderPosition, y: geo.size.width / 2)

                        // Labels
                        HStack {
                            Text("BEFORE")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(.white.opacity(0.7))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(.black.opacity(0.5))
                                .clipShape(Capsule())
                                .padding(12)
                            Spacer()
                            Text("AFTER")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(.white.opacity(0.7))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(.black.opacity(0.5))
                                .clipShape(Capsule())
                                .padding(12)
                        }
                        .frame(maxHeight: .infinity, alignment: .top)
                    }
                    .frame(height: geo.size.width)
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                let oldPos = sliderPosition
                                let newPosition = value.location.x / geo.size.width
                                sliderPosition = min(max(newPosition, 0.05), 0.95)
                                if (oldPos < 0.5 && sliderPosition >= 0.5) || (oldPos > 0.5 && sliderPosition <= 0.5) {
                                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                }
                            }
                    )
                }
                .aspectRatio(1, contentMode: .fit)
                .padding(.horizontal, GlowUpDesign.Spacing.md)

                // Feature label
                HStack {
                    Image(systemName: "sparkles")
                    Text(featureDisplayName)
                }
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.white)

                // Disclaimer
                Text("AI-generated artistic visualization for entertainment purposes only.")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.35))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, GlowUpDesign.Spacing.lg)

                // Action buttons
                VStack(spacing: GlowUpDesign.Spacing.sm) {
                    HStack(spacing: GlowUpDesign.Spacing.sm) {
                        Button {
                            showShareSheet = true
                        } label: {
                            HStack {
                                Image(systemName: "square.and.arrow.up")
                                Text("Share")
                            }
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                        }

                        Button {
                            router.goToRoot()
                        } label: {
                            HStack {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                Text("Try Another")
                            }
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                        }
                    }
                }
                .padding(.horizontal, GlowUpDesign.Spacing.md)

                Spacer()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            AnalyticsService.shared.trackScreen("feature_result_\(featureType)")
            withAnimation(.easeOut(duration: 1.0).delay(0.3)) {
                sliderPosition = 0.05
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation(.easeInOut(duration: 0.5)) {
                    sliderPosition = 0.5
                }
                revealComplete = true
            }
        }
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(originalImage: originalImage, transformedImage: transformedImage, styleName: featureDisplayName)
        }
    }
}
