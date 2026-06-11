import SwiftUI
import PhotosUI
import AVKit

struct AnimatePortraitView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var drivingVideoURL: URL?
    @State private var selectedVideoItem: PhotosPickerItem?
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var showCamera = false

    private let featureService = FeatureService.shared

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.backgroundGradient.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    // User photo
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    Text("Animate Portrait")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    Text("Record a short video of expressions to animate your photo")
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, GlowUpDesign.Spacing.lg)

                    // Driving video section
                    VStack(spacing: GlowUpDesign.Spacing.md) {
                        Text("Driving Video")
                            .font(GlowUpDesign.Typography.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity, alignment: .leading)

                        if let videoURL = drivingVideoURL {
                            // Video preview
                            VideoPlayer(player: AVPlayer(url: videoURL))
                                .frame(height: 200)
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))

                            Button("Change Video") {
                                drivingVideoURL = nil
                            }
                            .font(GlowUpDesign.Typography.caption)
                            .foregroundStyle(.white.opacity(0.6))
                        } else {
                            // Video picker
                            PhotosPicker(
                                selection: $selectedVideoItem,
                                matching: .videos
                            ) {
                                VStack(spacing: GlowUpDesign.Spacing.md) {
                                    Image(systemName: "video.badge.plus")
                                        .font(.system(size: 40))
                                        .foregroundStyle(.white.opacity(0.4))
                                    Text("Select a short video")
                                        .font(GlowUpDesign.Typography.body)
                                        .foregroundStyle(.white.opacity(0.5))
                                    Text("Make expressions, smile, wink — they'll transfer to your photo")
                                        .font(GlowUpDesign.Typography.caption)
                                        .foregroundStyle(.white.opacity(0.3))
                                        .multilineTextAlignment(.center)
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 180)
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                                .overlay(
                                    RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large)
                                        .stroke(.white.opacity(0.1), lineWidth: 1)
                                )
                            }
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Generate button
                    Button {
                        Task { await generate() }
                    } label: {
                        HStack {
                            if isProcessing {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text(isProcessing ? "Animating..." : "Animate Portrait")
                                .font(GlowUpDesign.Typography.headline)
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(drivingVideoURL != nil ? GlowUpDesign.Colors.gradient : LinearGradient(colors: [.gray.opacity(0.3)], startPoint: .leading, endPoint: .trailing))
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                    }
                    .disabled(drivingVideoURL == nil || isProcessing)
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    Text("AI-generated artistic animation for entertainment purposes only.")
                        .font(GlowUpDesign.Typography.micro)
                        .foregroundStyle(.white.opacity(0.25))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, GlowUpDesign.Spacing.lg)

                    Spacer(minLength: GlowUpDesign.Spacing.xxl)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: selectedVideoItem) { _, newItem in
            Task { await loadVideo(from: newItem) }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") {}
        } message: {
            Text(errorMessage ?? "Unknown error")
        }
        .onAppear { AnalyticsService.shared.trackScreen("animate_portrait") }
    }

    private func loadVideo(from item: PhotosPickerItem?) async {
        guard let item else { return }
        guard let movie = try? await item.loadTransferable(type: VideoTransferable.self) else {
            errorMessage = "Could not load the selected video."
            showError = true
            return
        }
        drivingVideoURL = movie.url
    }

    private func generate() async {
        guard let videoURL = drivingVideoURL else { return }
        isProcessing = true
        defer { isProcessing = false }

        do {
            let resultURL = try await featureService.animatePortrait(image: selectedImage, drivingVideoURL: videoURL)
            transformContext.resultVideoURL = resultURL
            transformContext.featureType = "animate_portrait"
            router.navigate(to: .videoResult(featureType: "animate_portrait"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

// Helper for loading video from PhotosPicker
struct VideoTransferable: Transferable {
    let url: URL

    static var transferRepresentation: some TransferRepresentation {
        FileRepresentation(contentType: .movie) { video in
            SentTransferredFile(video.url)
        } importing: { received in
            let tempURL = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString)
                .appendingPathExtension("mp4")
            try FileManager.default.copyItem(at: received.file, to: tempURL)
            return Self(url: tempURL)
        }
    }
}
