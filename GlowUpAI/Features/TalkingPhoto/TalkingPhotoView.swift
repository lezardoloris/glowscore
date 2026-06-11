import SwiftUI
import PhotosUI
import AVKit
import AVFoundation

struct TalkingPhotoView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var sourceVideoURL: URL?
    @State private var audioURL: URL?
    @State private var selectedVideoItem: PhotosPickerItem?
    @State private var isRecordingAudio = false
    @State private var audioRecorder: AVAudioRecorder?
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

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

                    Text("Talking Photo")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    Text("Make any face lip-sync to your voice or audio")
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.center)

                    // Premium badge
                    if !subscriptionManager.isSubscribed {
                        HStack(spacing: 6) {
                            Image(systemName: "crown.fill")
                                .foregroundStyle(.yellow)
                            Text("Premium Feature")
                                .font(GlowUpDesign.Typography.caption)
                                .foregroundStyle(.yellow)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(.yellow.opacity(0.15))
                        .clipShape(Capsule())
                        .onTapGesture { router.presentPaywall() }
                    }

                    // Step 1: Source video
                    VStack(spacing: GlowUpDesign.Spacing.sm) {
                        HStack {
                            Text("1")
                                .font(.caption.bold())
                                .foregroundStyle(.black)
                                .frame(width: 24, height: 24)
                                .background(GlowUpDesign.Colors.gradient)
                                .clipShape(Circle())
                            Text("Source Video")
                                .font(GlowUpDesign.Typography.headline)
                                .foregroundStyle(.white)
                            Spacer()
                            if sourceVideoURL != nil {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(.green)
                            }
                        }

                        if let videoURL = sourceVideoURL {
                            VideoPlayer(player: AVPlayer(url: videoURL))
                                .frame(height: 160)
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))

                            Button("Change Video") { sourceVideoURL = nil }
                                .font(GlowUpDesign.Typography.caption)
                                .foregroundStyle(.white.opacity(0.6))
                        } else {
                            PhotosPicker(selection: $selectedVideoItem, matching: .videos) {
                                HStack {
                                    Image(systemName: "video.badge.plus")
                                    Text("Select a short face video (3-10s)")
                                }
                                .font(GlowUpDesign.Typography.body)
                                .foregroundStyle(.white.opacity(0.5))
                                .frame(maxWidth: .infinity)
                                .frame(height: 100)
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                .overlay(
                                    RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                        .stroke(.white.opacity(0.1), lineWidth: 1)
                                )
                            }
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Step 2: Audio
                    VStack(spacing: GlowUpDesign.Spacing.sm) {
                        HStack {
                            Text("2")
                                .font(.caption.bold())
                                .foregroundStyle(.black)
                                .frame(width: 24, height: 24)
                                .background(GlowUpDesign.Colors.gradient)
                                .clipShape(Circle())
                            Text("Audio")
                                .font(GlowUpDesign.Typography.headline)
                                .foregroundStyle(.white)
                            Spacer()
                            if audioURL != nil {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(.green)
                            }
                        }

                        if audioURL != nil {
                            HStack {
                                Image(systemName: "waveform")
                                    .foregroundStyle(.green)
                                Text("Audio recorded")
                                    .font(GlowUpDesign.Typography.body)
                                    .foregroundStyle(.white)
                                Spacer()
                                Button("Re-record") {
                                    audioURL = nil
                                }
                                .font(GlowUpDesign.Typography.caption)
                                .foregroundStyle(.white.opacity(0.6))
                            }
                            .padding()
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                        } else {
                            Button {
                                toggleRecording()
                            } label: {
                                HStack {
                                    Image(systemName: isRecordingAudio ? "stop.circle.fill" : "mic.circle.fill")
                                        .font(.title)
                                        .foregroundStyle(isRecordingAudio ? .red : .white.opacity(0.5))
                                    Text(isRecordingAudio ? "Tap to Stop" : "Tap to Record Audio")
                                        .font(GlowUpDesign.Typography.body)
                                        .foregroundStyle(.white.opacity(0.5))
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 80)
                                .background(isRecordingAudio ? Color.red.opacity(0.15) : Color.white.opacity(0.05))
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                .overlay(
                                    RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                        .stroke(isRecordingAudio ? .red.opacity(0.5) : .white.opacity(0.1), lineWidth: 1)
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
                                ProgressView().tint(.white)
                            }
                            Text(isProcessing ? "Processing..." : "Make It Talk")
                                .font(GlowUpDesign.Typography.headline)
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(canGenerate ? GlowUpDesign.Colors.gradient : LinearGradient(colors: [.gray.opacity(0.3)], startPoint: .leading, endPoint: .trailing))
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                    }
                    .disabled(!canGenerate || isProcessing)
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    Text("AI-generated lip-sync for entertainment purposes only.")
                        .font(GlowUpDesign.Typography.micro)
                        .foregroundStyle(.white.opacity(0.25))
                        .multilineTextAlignment(.center)

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
        .onAppear { AnalyticsService.shared.trackScreen("talking_photo") }
    }

    private var canGenerate: Bool {
        sourceVideoURL != nil && audioURL != nil && subscriptionManager.isSubscribed
    }

    private func loadVideo(from item: PhotosPickerItem?) async {
        guard let item else { return }
        guard let movie = try? await item.loadTransferable(type: VideoTransferable.self) else {
            errorMessage = "Could not load the selected video."
            showError = true
            return
        }
        sourceVideoURL = movie.url
    }

    private func toggleRecording() {
        if isRecordingAudio {
            stopRecording()
        } else {
            startRecording()
        }
    }

    private func startRecording() {
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.playAndRecord, mode: .default)
            try audioSession.setActive(true)
        } catch {
            errorMessage = "Could not access microphone."
            showError = true
            return
        }

        let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("wav")

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatLinearPCM),
            AVSampleRateKey: 16000,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]

        do {
            audioRecorder = try AVAudioRecorder(url: tempURL, settings: settings)
            audioRecorder?.record()
            isRecordingAudio = true
        } catch {
            errorMessage = "Could not start recording: \(error.localizedDescription)"
            showError = true
        }
    }

    private func stopRecording() {
        audioRecorder?.stop()
        audioURL = audioRecorder?.url
        audioRecorder = nil
        isRecordingAudio = false
    }

    private func generate() async {
        guard let videoURL = sourceVideoURL, let audio = audioURL else { return }
        isProcessing = true
        defer { isProcessing = false }

        do {
            let resultURL = try await featureService.talkingPhoto(sourceVideoURL: videoURL, audioURL: audio)
            transformContext.resultVideoURL = resultURL
            transformContext.featureType = "talking_photo"
            router.navigate(to: .videoResult(featureType: "talking_photo"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
