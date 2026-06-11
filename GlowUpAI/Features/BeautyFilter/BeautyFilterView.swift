import SwiftUI
import PhotosUI

struct BeautyFilterView: View {
    @EnvironmentObject var router: NavigationRouter
    @State private var sourceImage: UIImage?
    @State private var filteredImage: UIImage?
    @State private var selectedItem: PhotosPickerItem?
    @State private var showBeforeAfter = false
    @State private var isSaving = false
    @State private var showSavedAlert = false
    @State private var errorMessage: String?

    // Slider values (0–100, some allow negative via mapping)
    @State private var smoothing: Float = 0
    @State private var brightness: Float = 0
    @State private var contrast: Float = 0
    @State private var saturation: Float = 0
    @State private var warmth: Float = 0
    @State private var sharpen: Float = 0

    @State private var selectedPresetIndex: Int? = nil

    private let engine = BeautyFilterEngine()

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                // MARK: - Image Preview
                imagePreviewSection
                    .frame(maxHeight: .infinity)

                // MARK: - Presets
                presetBar

                // MARK: - Sliders
                slidersSection
                    .padding(.horizontal, GlowUpDesign.Spacing.md)
                    .padding(.bottom, GlowUpDesign.Spacing.sm)

                // MARK: - Bottom Actions
                bottomActions
                    .padding(.horizontal, GlowUpDesign.Spacing.md)
                    .padding(.bottom, GlowUpDesign.Spacing.md)
            }
        }
        .navigationTitle("Beauty Filter")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                PhotosPicker(selection: $selectedItem, matching: .images) {
                    Image(systemName: "photo.on.rectangle")
                        .foregroundStyle(.white)
                }
            }
        }
        .onAppear {
            AnalyticsService.shared.trackScreen("beauty_filter")
        }
        .onChange(of: selectedItem) { _, newItem in
            Task { await loadImage(from: newItem) }
        }
        .alert("Saved!", isPresented: $showSavedAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Photo saved to your library.")
        }
        .alert("Error", isPresented: Binding(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } })) {
            Button("OK") { errorMessage = nil }
        } message: {
            Text(errorMessage ?? "")
        }
    }

    // MARK: - Subviews

    @ViewBuilder
    private var imagePreviewSection: some View {
        if let displayImage = showBeforeAfter ? sourceImage : filteredImage ?? sourceImage {
            Image(uiImage: displayImage)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                .padding(GlowUpDesign.Spacing.md)
                .overlay(alignment: .topLeading) {
                    if showBeforeAfter {
                        Text("BEFORE")
                            .font(GlowUpDesign.Typography.micro)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.black.opacity(0.6))
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                            .padding(GlowUpDesign.Spacing.lg)
                    }
                }
        } else {
            VStack(spacing: GlowUpDesign.Spacing.md) {
                Image(systemName: "photo.badge.plus")
                    .font(.system(size: 48))
                    .foregroundStyle(.white.opacity(0.3))
                Text("Select a photo to get started")
                    .font(GlowUpDesign.Typography.body)
                    .foregroundStyle(.white.opacity(0.5))
                PhotosPicker(selection: $selectedItem, matching: .images) {
                    Text("Choose Photo")
                        .font(GlowUpDesign.Typography.headline)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(GlowUpDesign.Colors.gradient)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                }
            }
        }
    }

    private var presetBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: GlowUpDesign.Spacing.sm) {
                ForEach(Array(BeautyFilterEngine.presets.enumerated()), id: \.offset) { index, preset in
                    Button {
                        applyPreset(preset, index: index)
                    } label: {
                        Text(preset.name)
                            .font(GlowUpDesign.Typography.caption)
                            .foregroundStyle(selectedPresetIndex == index ? .white : .white.opacity(0.7))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(selectedPresetIndex == index ? GlowUpDesign.Colors.gradient : LinearGradient(colors: [.white.opacity(0.1), .white.opacity(0.1)], startPoint: .leading, endPoint: .trailing))
                            .clipShape(Capsule())
                    }
                }
            }
            .padding(.horizontal, GlowUpDesign.Spacing.md)
            .padding(.vertical, GlowUpDesign.Spacing.sm)
        }
    }

    private var slidersSection: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 10) {
                filterSlider(title: "Smoothing", value: $smoothing, range: 0...100)
                filterSlider(title: "Brightness", value: $brightness, range: -50...50)
                filterSlider(title: "Contrast", value: $contrast, range: -50...50)
                filterSlider(title: "Saturation", value: $saturation, range: -50...50)
                filterSlider(title: "Warmth", value: $warmth, range: -50...50)
                filterSlider(title: "Sharpen", value: $sharpen, range: 0...100)
            }
        }
        .frame(maxHeight: 200)
    }

    private func filterSlider(title: String, value: Binding<Float>, range: ClosedRange<Float>) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(title)
                    .font(GlowUpDesign.Typography.caption)
                    .foregroundStyle(.white.opacity(0.7))
                Spacer()
                Text("\(Int(value.wrappedValue))")
                    .font(GlowUpDesign.Typography.micro)
                    .foregroundStyle(.white.opacity(0.5))
                    .monospacedDigit()
            }
            Slider(value: value, in: range, step: 1) { editing in
                if !editing {
                    selectedPresetIndex = nil
                    applyFilters()
                }
            }
            .tint(GlowUpDesign.Colors.primary)
        }
    }

    private var bottomActions: some View {
        HStack(spacing: GlowUpDesign.Spacing.md) {
            // Before/After Toggle
            Button {
                showBeforeAfter.toggle()
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: showBeforeAfter ? "eye.slash" : "eye")
                    Text(showBeforeAfter ? "After" : "Before")
                }
                .font(GlowUpDesign.Typography.caption)
                .foregroundStyle(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.small))
            }
            .disabled(sourceImage == nil)

            Spacer()

            // Reset
            Button {
                resetSliders()
            } label: {
                Text("Reset")
                    .font(GlowUpDesign.Typography.caption)
                    .foregroundStyle(.white.opacity(0.6))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.small))
            }

            // Save
            Button {
                saveImage()
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "square.and.arrow.down")
                    Text("Save")
                }
                .font(GlowUpDesign.Typography.headline)
                .foregroundStyle(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(GlowUpDesign.Colors.gradient)
                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.small))
            }
            .disabled(filteredImage == nil)
            .opacity(filteredImage == nil ? 0.5 : 1)
        }
    }

    // MARK: - Actions

    private func loadImage(from item: PhotosPickerItem?) async {
        guard let item else { return }
        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data) else {
            errorMessage = "Could not load the selected photo."
            return
        }
        sourceImage = image
        selectedItem = nil
        applyFilters()
    }

    private func applyPreset(_ preset: BeautyFilterEngine.Preset, index: Int) {
        selectedPresetIndex = index
        smoothing = preset.smoothing
        brightness = preset.brightness
        contrast = preset.contrast
        saturation = preset.saturation
        warmth = preset.warmth
        sharpen = preset.sharpen
        applyFilters()
    }

    private func applyFilters() {
        guard let source = sourceImage, let ciImage = CIImage(image: source) else { return }
        let result = engine.applyFilter(
            to: ciImage,
            smoothing: smoothing,
            brightness: brightness,
            contrast: contrast,
            saturation: saturation,
            warmth: warmth,
            sharpen: sharpen
        )
        filteredImage = engine.renderToUIImage(result)
    }

    private func resetSliders() {
        smoothing = 0; brightness = 0; contrast = 0
        saturation = 0; warmth = 0; sharpen = 0
        selectedPresetIndex = nil
        filteredImage = sourceImage
    }

    private func saveImage() {
        guard let image = filteredImage else { return }
        isSaving = true
        UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
        isSaving = false
        showSavedAlert = true
        AnalyticsService.shared.track("beauty_filter_saved")
    }
}
