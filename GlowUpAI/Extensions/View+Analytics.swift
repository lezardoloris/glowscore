import SwiftUI

extension View {
    func trackScreen(_ name: String) -> some View {
        onAppear {
            AnalyticsService.shared.trackScreen(name)
        }
    }

    func trackTap(_ event: String, properties: [String: Any] = [:]) -> some View {
        simultaneousGesture(TapGesture().onEnded {
            AnalyticsService.shared.track(event, properties: properties)
        })
    }
}
