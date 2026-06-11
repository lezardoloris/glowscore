import SwiftUI

struct HDCompareView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var context: TransformContext

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.backgroundGradient
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {

                    // MARK: - Title
                    Text("Compare Quality")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.top, GlowUpDesign.Spacing.lg)

                    // MARK: - Side-by-side comparison
                    HStack(spacing: GlowUpDesign.Spacing.sm) {
                        ComparisonPanel(
                            label: "STANDARD",
                            image: context.transformedImage,
                            isHD: false
                        )
                        ComparisonPanel(
                            label: "HD",
                            image: context.transformedImage,
                            isHD: true
                        )
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // MARK: - Copy
                    Text("See the difference HD makes")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.center)

                    // MARK: - Value prop
                    Text("Get HD quality + exclusive monthly style drops")
                        .font(.system(size: 15))
                        .foregroundStyle(.white.opacity(0.6))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, GlowUpDesign.Spacing.xl)

                    Spacer(minLength: GlowUpDesign.Spacing.xxl)

                    // MARK: - Primary CTA
                    Button {
                        router.navigate(to: .pricing)
                    } label: {
                        Text("Upgrade to Premium →")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(
                                LinearGradient(
                                    colors: [.pink, .purple],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.xl - 12)

                    // MARK: - Secondary dismiss
                    Button {
                        router.goBack()
                    } label: {
                        Text("Keep Standard")
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.white.opacity(0.6))
                    }
                    .padding(.bottom, GlowUpDesign.Spacing.xl)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            AnalyticsService.shared.trackScreen("hd_compare")
        }
    }
}

// MARK: - Comparison Panel

private struct ComparisonPanel: View {
    let label: String
    let image: UIImage?
    let isHD: Bool

    var body: some View {
        ZStack(alignment: .top) {
            // Image content
            if let uiImage = image {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
                    .frame(minHeight: 280)
                    .clipped()
                    .blur(radius: isHD ? 0 : 1.8)
            } else {
                // Placeholder when no image is available
                ZStack {
                    LinearGradient(
                        colors: [.purple.opacity(0.3), .pink.opacity(0.2)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    Image(systemName: "photo.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.white.opacity(0.15))
                }
                .frame(minHeight: 280)
                .blur(radius: isHD ? 0 : 3.0)
            }

            // Label overlay
            Text(label)
                .font(.system(size: 11, weight: .bold))
                .tracking(1.2)
                .foregroundStyle(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
                .padding(.top, 10)
        }
        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.xl))
        .overlay(
            RoundedRectangle(cornerRadius: GlowUpDesign.Radius.xl)
                .stroke(.ultraThinMaterial, lineWidth: 1)
        )
    }
}
