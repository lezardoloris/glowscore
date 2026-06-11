import SwiftUI
import PhotosUI
import AVFoundation

struct CameraView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var transformContext: TransformContext
    @State private var selectedItem: PhotosPickerItem?
    @State private var showCamera = false
    @State private var capturedImage: UIImage?
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showLowConfidenceWarning = false
    @State private var cameraAccessDenied = false

    private let faceDetection = FaceDetectionService()

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [.black, Color(red: 0.1, green: 0.05, blue: 0.15)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                // Hero text
                VStack(spacing: 12) {
                    Text("See Your")
                        .font(.system(size: 36, weight: .light))
                        .foregroundStyle(.white.opacity(0.8))
                    Text("Best Self")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [.pink, .purple, .blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                }

                Text("Upload a selfie and transform\nyour look in 30 seconds")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.6))
                    .multilineTextAlignment(.center)

                Spacer()

                // Action buttons
                VStack(spacing: 16) {
                    // H8+M10 FIX: Check camera availability AND permission before presenting
                    Button {
                        if !UIImagePickerController.isSourceTypeAvailable(.camera) {
                            errorMessage = "Camera is not available on this device. Please choose a photo from your library."
                            return
                        }
                        switch AVCaptureDevice.authorizationStatus(for: .video) {
                        case .authorized:
                            showCamera = true
                        case .notDetermined:
                            Task {
                                let granted = await AVCaptureDevice.requestAccess(for: .video)
                                if granted { showCamera = true }
                                else { errorMessage = "Camera access is needed to take selfies. You can enable it in Settings." }
                            }
                        case .denied, .restricted:
                            errorMessage = "Camera access was denied. Go to Settings > GlowUp AI > Camera to enable it."
                        @unknown default:
                            showCamera = true
                        }
                    } label: {
                        HStack {
                            Image(systemName: "camera.fill")
                            Text("Take a Selfie")
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(.white.opacity(0.2), lineWidth: 1)
                        )
                    }

                    // Choose from library
                    PhotosPicker(selection: $selectedItem, matching: .images) {
                        HStack {
                            Image(systemName: "photo.on.rectangle")
                            Text("Choose Photo")
                        }
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
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                }
                .padding(.horizontal, 24)

                Spacer()
                    .frame(height: 40)
            }

            // Loading overlay
            if isProcessing {
                Color.black.opacity(0.6)
                    .ignoresSafeArea()
                VStack(spacing: 16) {
                    ProgressView()
                        .tint(.white)
                        .scaleEffect(1.5)
                    Text("Detecting face...")
                        .foregroundStyle(.white)
                }
            }

            // M9 FIX: Low confidence warning banner
            if showLowConfidenceWarning {
                VStack {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(.yellow)
                        Text("Low face detection confidence. Try a clearer, well-lit photo for better results.")
                            .font(.caption)
                            .foregroundStyle(.white)
                    }
                    .padding(12)
                    .background(.black.opacity(0.85))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .padding(.horizontal, 16)
                    .padding(.top, 60)
                    Spacer()
                }
                .transition(.move(edge: .top).combined(with: .opacity))
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        withAnimation { showLowConfidenceWarning = false }
                    }
                }
            }

            // M10 FIX: Camera denial overlay
            if cameraAccessDenied {
                Color.black.opacity(0.85)
                    .ignoresSafeArea()
                VStack(spacing: 20) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.white.opacity(0.4))
                    Text("Camera Access Needed")
                        .font(.title2.bold())
                        .foregroundStyle(.white)
                    Text("Allow camera access to take selfies for your glow-up.")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.6))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                    Button {
                        if let url = URL(string: UIApplication.openSettingsURLString) {
                            UIApplication.shared.open(url)
                        }
                    } label: {
                        Text("Open Settings")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 32)
                            .padding(.vertical, 14)
                            .background(LinearGradient(colors: [.pink, .purple], startPoint: .leading, endPoint: .trailing))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    Button {
                        cameraAccessDenied = false
                    } label: {
                        Text("Or choose a photo from your library")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.5))
                            .underline()
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            AnalyticsService.shared.trackScreen("camera")
            // M10 FIX: Check camera permission on appear and show overlay if denied
            let status = AVCaptureDevice.authorizationStatus(for: .video)
            if status == .denied || status == .restricted {
                cameraAccessDenied = true
            }
        }
        .alert("Error", isPresented: Binding(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } })) {
            Button("OK") { errorMessage = nil }
            // M10 FIX: Show Settings button when camera access was denied
            if errorMessage?.contains("Settings") == true {
                Button("Open Settings") {
                    errorMessage = nil
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                }
            }
        } message: {
            Text(errorMessage ?? "")
        }
        .onChange(of: selectedItem) { _, newItem in
            Task { await handleSelectedItem(newItem) }
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraCapture(image: $capturedImage)
        }
        .onChange(of: capturedImage) { _, image in
            if let image {
                Task { await processImage(image, source: "camera") }
            }
        }
    }

    private func handleSelectedItem(_ item: PhotosPickerItem?) async {
        guard let item else { return }
        defer { selectedItem = nil } // Reset so same item can be re-selected
        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data) else {
            errorMessage = "Could not load the selected photo."
            return
        }
        await processImage(image, source: "library")
    }

    private func processImage(_ image: UIImage, source: String) async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            // M9 FIX: Use detectFace to get confidence warning flag
            let result = try await faceDetection.detectFace(from: image)
            AnalyticsService.shared.trackPhotoCaptured(source: source)
            AnalyticsService.shared.trackFaceDetected(confidence: result.confidence)

            if result.lowConfidence {
                showLowConfidenceWarning = true
                // Brief delay so user sees the warning before navigating
                try? await Task.sleep(for: .seconds(2))
            }

            transformContext.selectedImage = result.image
            router.navigate(to: .featureHub)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - Camera Capture (UIKit wrapper)
struct CameraCapture: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.cameraDevice = .front
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraCapture

        init(_ parent: CameraCapture) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            parent.image = info[.originalImage] as? UIImage
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}
