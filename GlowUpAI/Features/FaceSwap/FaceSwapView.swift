import SwiftUI
import PhotosUI

struct FaceSwapCategory: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let description: String
}

struct FaceSwapView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var selectedCategory: FaceSwapCategory?
    @State private var customTargetImage: UIImage?
    @State private var selectedItem: PhotosPickerItem?
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let categories: [FaceSwapCategory] = [
        FaceSwapCategory(name: "Celebrity", icon: "star.fill", description: "Red carpet looks"),
        FaceSwapCategory(name: "Movie Star", icon: "film.fill", description: "Iconic movie scenes"),
        FaceSwapCategory(name: "Magazine Cover", icon: "book.fill", description: "Cover model vibes"),
        FaceSwapCategory(name: "Historical", icon: "clock.fill", description: "Travel through time"),
        FaceSwapCategory(name: "Superhero", icon: "bolt.fill", description: "Unleash your power"),
        FaceSwapCategory(name: "Custom", icon: "photo.on.rectangle", description: "Pick your own image"),
    ]

    private let columns = [
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.md),
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.md)
    ]

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    // User selfie preview
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    Text("Face Swap")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    Text("Choose a scene to swap into")
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white.opacity(0.6))

                    // Category grid
                    LazyVGrid(columns: columns, spacing: GlowUpDesign.Spacing.md) {
                        ForEach(categories) { category in
                            if category.name == "Custom" {
                                // Custom: open photo picker
                                PhotosPicker(selection: $selectedItem, matching: .images) {
                                    categoryCard(category: category, isSelected: false)
                                }
                            } else {
                                Button {
                                    selectedCategory = category
                                } label: {
                                    categoryCard(category: category, isSelected: selectedCategory?.name == category.name)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Custom target preview
                    if let customImage = customTargetImage {
                        VStack(spacing: GlowUpDesign.Spacing.sm) {
                            Text("Target Image")
                                .font(GlowUpDesign.Typography.caption)
                                .foregroundStyle(.white.opacity(0.6))
                            Image(uiImage: customImage)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 80, height: 80)
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                        }
                    }

                    // Generate CTA
                    if selectedCategory != nil || customTargetImage != nil {
                        Button {
                            Task { await generateFaceSwap() }
                        } label: {
                            HStack {
                                if isProcessing {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Image(systemName: "arrow.triangle.2.circlepath")
                                    Text("Swap Face")
                                }
                            }
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(GlowUpDesign.Colors.gradient)
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                        }
                        .disabled(isProcessing)
                        .padding(.horizontal, GlowUpDesign.Spacing.md)
                    }

                    Spacer(minLength: GlowUpDesign.Spacing.xxl)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: selectedItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    customTargetImage = image
                    selectedCategory = nil
                }
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") { errorMessage = nil }
        } message: { Text(errorMessage ?? "") }
        .onAppear { AnalyticsService.shared.trackScreen("face_swap") }
    }

    @ViewBuilder
    private func categoryCard(category: FaceSwapCategory, isSelected: Bool) -> some View {
        VStack(spacing: GlowUpDesign.Spacing.sm) {
            ZStack {
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 56, height: 56)

                Image(systemName: category.icon)
                    .font(.title2)
                    .foregroundStyle(GlowUpDesign.Colors.gradient)
            }

            Text(category.name)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.white)

            Text(category.description)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.5))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
        .overlay(
            RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large)
                .stroke(isSelected ? Color.pink : .white.opacity(0.1), lineWidth: isSelected ? 2 : 1)
        )
    }

    private func generateFaceSwap() async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            // Use custom image or placeholder for category-based swap
            let targetImage = customTargetImage ?? selectedImage
            let quality = subscriptionManager.isSubscribed ? "hd" : "standard"
            let result = try await featureService.faceSwap(source: selectedImage, target: targetImage, quality: quality)

            transformContext.transformedImage = result
            transformContext.featureType = "face_swap"
            router.navigate(to: .featureResult(featureType: "face_swap"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
