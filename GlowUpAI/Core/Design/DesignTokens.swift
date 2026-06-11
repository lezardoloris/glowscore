import SwiftUI

enum GlowUpDesign {
    // MARK: - Colors
    enum Colors {
        static let primary = Color.pink
        static let secondary = Color.purple
        static let accent = Color.blue
        static let background = Color.black
        static let surfaceLight = Color.white.opacity(0.05)

        static let gradient = LinearGradient(
            colors: [.pink, .purple],
            startPoint: .leading,
            endPoint: .trailing
        )

        static let heroGradient = LinearGradient(
            colors: [.pink, .purple, .blue],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let backgroundGradient = LinearGradient(
            colors: [.black, Color(red: 0.1, green: 0.05, blue: 0.15)],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    // MARK: - Typography
    enum Typography {
        static let heroTitle = Font.system(size: 48, weight: .bold)
        static let heroSubtitle = Font.system(size: 36, weight: .light)
        static let title = Font.system(size: 24, weight: .bold)
        static let headline = Font.system(size: 17, weight: .semibold)
        static let body = Font.system(size: 15, weight: .regular)
        static let caption = Font.system(size: 12, weight: .regular)
        static let micro = Font.system(size: 10, weight: .medium)
    }

    // MARK: - Spacing
    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }

    // MARK: - Corner Radius
    enum Radius {
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let xl: CGFloat = 20
        static let circle: CGFloat = 999
    }

    // MARK: - Animation
    enum Animation {
        static let quick = SwiftUI.Animation.easeOut(duration: 0.2)
        static let standard = SwiftUI.Animation.easeInOut(duration: 0.35)
        static let slow = SwiftUI.Animation.easeInOut(duration: 0.6)
        static let spring = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.75)
        static let reveal = SwiftUI.Animation.easeOut(duration: 1.0)
    }
}
