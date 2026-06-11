import SwiftUI

struct ResultView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    let originalImage: UIImage
    let transformedImage: UIImage
    let style: StylePreset
    let isHD: Bool

    @State private var sliderPosition: CGFloat = 0.5
    @State private var showShareSheet = false
    @State private var revealComplete = false
    @State private var showNotificationPrompt = false

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 20) {
                // Before/After Slider
                GeometryReader { geo in
                    ZStack {
                        // Transformed (right side / revealed)
                        Image(uiImage: transformedImage)
                            .resizable()
                            .scaledToFill()
                            .frame(width: geo.size.width, height: geo.size.width)
                            .clipped()

                        // Original (left side / hidden by slider)
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
                        VStack {
                            Spacer()
                                .frame(height: 0)
                        }
                        .frame(maxHeight: .infinity)
                        .overlay(
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
                        )

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
                            // H5 FIX: Only haptic at center crossing, not every pixel
                            .onChanged { value in
                                let oldPos = sliderPosition
                                let newPosition = value.location.x / geo.size.width
                                sliderPosition = min(max(newPosition, 0.05), 0.95)
                                // Haptic only when crossing center
                                if (oldPos < 0.5 && sliderPosition >= 0.5) || (oldPos > 0.5 && sliderPosition <= 0.5) {
                                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                }
                            }
                    )
                }
                .aspectRatio(1, contentMode: .fit)
                .padding(.horizontal, 16)

                // Style label with quality badge
                HStack {
                    Image(systemName: style.icon)
                    Text(style.name)
                    if isHD {
                        Text("HD")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(.green)
                            .clipShape(Capsule())
                    } else {
                        Text("Standard")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(.white.opacity(0.7))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(.white.opacity(0.15))
                            .clipShape(Capsule())
                    }
                }
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.white)

                // C6 FIX: Artistic visualization disclaimer (App Store compliance)
                Text("AI-generated artistic visualization for entertainment purposes only.")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.35))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                // Action buttons
                VStack(spacing: 12) {
                    if !isHD && !subscriptionManager.isSubscribed {
                        // Compare HD soft conversion CTA
                        Button {
                            router.navigate(to: .hdCompare)
                        } label: {
                            HStack {
                                Image(systemName: "arrow.left.arrow.right.square")
                                Text("Compare HD")
                            }
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(colors: [.pink, .purple], startPoint: .leading, endPoint: .trailing)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        }
                    }

                    HStack(spacing: 12) {
                        // Share button
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
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        // Try another style
                        Button {
                            router.goToRoot() // Safe navigation to root instead of double-pop
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
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                .padding(.horizontal, 16)

                Spacer()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            AnalyticsService.shared.trackScreen("result")
            // Animate the reveal
            withAnimation(.easeOut(duration: 1.0).delay(0.3)) {
                sliderPosition = 0.05
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation(.easeInOut(duration: 0.5)) {
                    sliderPosition = 0.5
                }
                revealComplete = true
            }
            // H3 FIX: Removed auto-paywall — Apple rejects non-user-initiated paywalls.
        }
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(originalImage: originalImage, transformedImage: transformedImage, styleName: style.name)
        }
        // M12: Notification opt-in prompt (shows once, on the screen user is actually viewing)
        .task {
            try? await Task.sleep(for: .seconds(5))
            if !UserDefaults.standard.bool(forKey: "notification_requested") {
                UserDefaults.standard.set(true, forKey: "notification_requested")
                showNotificationPrompt = true
            }
        }
        .alert("Get New Style Alerts?", isPresented: $showNotificationPrompt) {
            Button("Yes, Notify Me") {
                NotificationService.shared.requestPermission()
                NotificationService.shared.scheduleWeeklyStyleNotification()
            }
            Button("Not Now", role: .cancel) {}
        } message: {
            Text("We'll notify you when new transformation styles drop each week. You can change this anytime in Settings.")
        }
    }
}
