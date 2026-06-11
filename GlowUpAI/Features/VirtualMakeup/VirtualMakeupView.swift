import SwiftUI
import PhotosUI

struct VirtualMakeupView: View {
    @EnvironmentObject var router: NavigationRouter
    @State private var sourceImage: UIImage?
    @State private var resultImage: UIImage?
    @State private var selectedItem: PhotosPickerItem?
    @State private var showBeforeAfter = false
    @State private var showSavedAlert = false
    @State private var isProcessing = false
    @State private var errorMessage: String?

    // Lip
    @State private var lipColorIndex = 0
    @State private var lipOpacity: Float = 0

    // Eye Shadow
    @State private var eyeShadowColorIndex = 0
    @State private var eyeShadowOpacity: Float = 0

    // Blush
    @State private var blushColorIndex = 0
    @State private var blushOpacity: Float = 0

    // Eyeliner
    @State private var eyelinerEnabled = false
    @State private var eyelinerThickness: Float = 2

    @State private var selectedPresetIndex: Int? = nil

    private let engine = MakeupEngine()

    // MARK: - Color Palettes

    private static let lipColors: [(name: String, color: UIColor)] = [
        ("Red",   UIColor(red: 0.80, green: 0.10, blue: 0.10, alpha: 1)),
        ("Pink",  UIColor(red: 0.90, green: 0.40, blue: 0.55, alpha: 1)),
        ("Nude",  UIColor(red: 0.85, green: 0.65, blue: 0.55, alpha: 1)),
        ("Berry", UIColor(red: 0.55, green: 0.10, blue: 0.30, alpha: 1)),
        ("Coral", UIColor(red: 0.95, green: 0.45, blue: 0.35, alpha: 1)),
        ("Mauve", UIColor(red: 0.70, green: 0.40, blue: 0.50, alpha: 1)),
    ]

    private static let eyeShadowColors: [(name: String, color: UIColor)] = [
        ("Gold",   UIColor(red: 0.85, green: 0.72, blue: 0.40, alpha: 1)),
        ("Brown",  UIColor(red: 0.55, green: 0.35, blue: 0.20, alpha: 1)),
        ("Purple", UIColor(red: 0.50, green: 0.20, blue: 0.55, alpha: 1)),
        ("Blue",   UIColor(red: 0.20, green: 0.35, blue: 0.65, alpha: 1)),
        ("Green",  UIColor(red: 0.25, green: 0.50, blue: 0.30, alpha: 1)),
        ("Smoky",  UIColor(red: 0.25, green: 0.25, blue: 0.25, alpha: 1)),
    ]

    private static let blushColors: [(name: String, color: UIColor)] = [
        ("Pink",  UIColor(red: 1.0, green: 0.55, blue: 0.60, alpha: 1)),
        ("Peach", UIColor(red: 1.0, green: 0.70, blue: 0.55, alpha: 1)),
        ("Rose",  UIColor(red: 0.90, green: 0.45, blue: 0.50, alpha: 1)),
        ("Coral", UIColor(red: 0.95, green: 0.55, blue: 0.45, alpha: 1)),
    ]

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                // Image Preview
                imagePreviewSection
                    .frame(maxHeight: .infinity)

                // Presets
                presetBar

                // Makeup Controls
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: GlowUpDesign.Spacing.md) {
                        makeupSection(title: "Lips") {
                            colorPicker(colors: Self.lipColors, selectedIndex: $lipColorIndex)
                            opacitySlider(label: "Lip Opacity", value: $lipOpacity)
                        }

                        makeupSection(title: "Eye Shadow") {
                            colorPicker(colors: Self.eyeShadowColors, selectedIndex: $eyeShadowColorIndex)
                            opacitySlider(label: "Shadow Opacity", value: $eyeShadowOpacity)
                        }

                        makeupSection(title: "Blush") {
                            colorPicker(colors: Self.blushColors, selectedIndex: $blushColorIndex)
                            opacitySlider(label: "Blush Opacity", value: $blushOpacity)
                        }

                        makeupSection(title: "Eyeliner") {
                            HStack {
                                Text("Eyeliner")
                                    .font(GlowUpDesign.Typography.caption)
                                    .foregroundStyle(.white.opacity(0.7))
                                Spacer()
                                Toggle("", isOn: $eyelinerEnabled)
                                    .labelsHidden()
                                    .tint(GlowUpDesign.Colors.primary)
                                    .onChange(of: eyelinerEnabled) { _, _ in
                                        selectedPresetIndex = nil
                                        applyMakeup()
                                    }
                            }
                            if eyelinerEnabled {
                                opacitySlider(label: "Thickness", value: $eyelinerThickness, range: 1...5)
                            }
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)
                }
                .frame(maxHeight: 220)

                // Bottom Actions
                bottomActions
                    .padding(.horizontal, GlowUpDesign.Spacing.md)
                    .padding(.bottom, GlowUpDesign.Spacing.md)
            }

            if isProcessing {
                Color.black.opacity(0.5).ignoresSafeArea()
                ProgressView()
                    .tint(.white)
                    .scaleEffect(1.5)
            }
        }
        .navigationTitle("Virtual Makeup")
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
            AnalyticsService.shared.trackScreen("virtual_makeup")
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
        if let displayImage = showBeforeAfter ? sourceImage : resultImage ?? sourceImage {
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
                Image(systemName: "face.smiling")
                    .font(.system(size: 48))
                    .foregroundStyle(.white.opacity(0.3))
                Text("Select a photo to apply makeup")
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
                ForEach(Array(MakeupPreset.presets.enumerated()), id: \.offset) { index, preset in
                    Button {
                        applyPresetLook(preset, index: index)
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

    private func makeupSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: GlowUpDesign.Spacing.xs) {
            Text(title)
                .font(GlowUpDesign.Typography.headline)
                .foregroundStyle(.white)
            content()
        }
    }

    private func colorPicker(colors: [(name: String, color: UIColor)], selectedIndex: Binding<Int>) -> some View {
        HStack(spacing: GlowUpDesign.Spacing.sm) {
            ForEach(Array(colors.enumerated()), id: \.offset) { index, item in
                Button {
                    selectedIndex.wrappedValue = index
                    selectedPresetIndex = nil
                    applyMakeup()
                } label: {
                    VStack(spacing: 4) {
                        Circle()
                            .fill(Color(item.color))
                            .frame(width: 30, height: 30)
                            .overlay(
                                Circle()
                                    .stroke(.white, lineWidth: selectedIndex.wrappedValue == index ? 2 : 0)
                            )
                        Text(item.name)
                            .font(GlowUpDesign.Typography.micro)
                            .foregroundStyle(.white.opacity(0.6))
                    }
                }
            }
        }
    }

    private func opacitySlider(label: String, value: Binding<Float>, range: ClosedRange<Float> = 0...100) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(label)
                    .font(GlowUpDesign.Typography.caption)
                    .foregroundStyle(.white.opacity(0.6))
                Spacer()
                Text("\(Int(value.wrappedValue))")
                    .font(GlowUpDesign.Typography.micro)
                    .foregroundStyle(.white.opacity(0.4))
                    .monospacedDigit()
            }
            Slider(value: value, in: range, step: 1) { editing in
                if !editing {
                    selectedPresetIndex = nil
                    applyMakeup()
                }
            }
            .tint(GlowUpDesign.Colors.primary)
        }
    }

    private var bottomActions: some View {
        HStack(spacing: GlowUpDesign.Spacing.md) {
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

            Button {
                resetMakeup()
            } label: {
                Text("Reset")
                    .font(GlowUpDesign.Typography.caption)
                    .foregroundStyle(.white.opacity(0.6))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.small))
            }

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
            .disabled(resultImage == nil)
            .opacity(resultImage == nil ? 0.5 : 1)
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
        applyMakeup()
    }

    private func buildConfig() -> MakeupConfig {
        MakeupConfig(
            lipColor: Self.lipColors[lipColorIndex].color,
            lipOpacity: lipOpacity / 100.0,
            eyeShadowColor: Self.eyeShadowColors[eyeShadowColorIndex].color,
            eyeShadowOpacity: eyeShadowOpacity / 100.0,
            blushColor: Self.blushColors[blushColorIndex].color,
            blushOpacity: blushOpacity / 100.0,
            eyelinerEnabled: eyelinerEnabled,
            eyelinerThickness: eyelinerThickness
        )
    }

    private func applyMakeup() {
        guard let source = sourceImage else { return }
        let config = buildConfig()
        // Skip processing if everything is zeroed out
        if config.lipOpacity <= 0 && config.eyeShadowOpacity <= 0 && config.blushOpacity <= 0 && !config.eyelinerEnabled {
            resultImage = source
            return
        }
        isProcessing = true
        Task {
            let result = await engine.applyMakeup(to: source, config: config)
            await MainActor.run {
                resultImage = result
                isProcessing = false
            }
        }
    }

    private func applyPresetLook(_ preset: MakeupPreset, index: Int) {
        selectedPresetIndex = index
        let cfg = preset.config

        // Map preset config back to UI state
        lipOpacity = cfg.lipOpacity * 100
        eyeShadowOpacity = cfg.eyeShadowOpacity * 100
        blushOpacity = cfg.blushOpacity * 100
        eyelinerEnabled = cfg.eyelinerEnabled
        eyelinerThickness = cfg.eyelinerThickness

        // Find closest color indices
        lipColorIndex = Self.closestColorIndex(target: cfg.lipColor, in: Self.lipColors.map(\.color))
        eyeShadowColorIndex = Self.closestColorIndex(target: cfg.eyeShadowColor, in: Self.eyeShadowColors.map(\.color))
        blushColorIndex = Self.closestColorIndex(target: cfg.blushColor, in: Self.blushColors.map(\.color))

        applyMakeup()
    }

    private func resetMakeup() {
        lipOpacity = 0; eyeShadowOpacity = 0; blushOpacity = 0
        eyelinerEnabled = false; eyelinerThickness = 2
        lipColorIndex = 0; eyeShadowColorIndex = 0; blushColorIndex = 0
        selectedPresetIndex = nil
        resultImage = sourceImage
    }

    private func saveImage() {
        guard let image = resultImage else { return }
        UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
        showSavedAlert = true
        AnalyticsService.shared.track("virtual_makeup_saved")
    }

    // MARK: - Utility

    private static func closestColorIndex(target: UIColor, in palette: [UIColor]) -> Int {
        var r1: CGFloat = 0, g1: CGFloat = 0, b1: CGFloat = 0, a1: CGFloat = 0
        target.getRed(&r1, green: &g1, blue: &b1, alpha: &a1)
        var bestIndex = 0
        var bestDist: CGFloat = .greatestFiniteMagnitude
        for (i, c) in palette.enumerated() {
            var r2: CGFloat = 0, g2: CGFloat = 0, b2: CGFloat = 0, a2: CGFloat = 0
            c.getRed(&r2, green: &g2, blue: &b2, alpha: &a2)
            let dist = (r1 - r2) * (r1 - r2) + (g1 - g2) * (g1 - g2) + (b1 - b2) * (b1 - b2)
            if dist < bestDist { bestDist = dist; bestIndex = i }
        }
        return bestIndex
    }
}
