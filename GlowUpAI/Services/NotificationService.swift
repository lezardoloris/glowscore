import Foundation
import UserNotifications

final class NotificationService {
    static let shared = NotificationService()

    // MARK: - Identifiers
    private enum Identifier {
        static let weeklyStyleDrop = "weekly_style_drop"
        static let reEngagement = "re_engagement_72h"
        static let trialEnding = "trial_ending_reminder"
    }

    private init() {}

    // MARK: - Permission

    func requestPermission() async -> Bool {
        do {
            return try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
        } catch {
            return false
        }
    }

    // MARK: - Weekly Style Drop (Monday 10 AM)

    func scheduleWeeklyStyleNotification() {
        let content = UNMutableNotificationContent()
        content.title = "New Style Dropped!"
        content.body = "Check out this week's new transformation style."
        content.sound = .default
        content.categoryIdentifier = "style_drop"

        // Every Monday at 10 AM local time (weekday 2 = Monday)
        var dateComponents = DateComponents()
        dateComponents.weekday = 2
        dateComponents.hour = 10
        dateComponents.minute = 0

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(
            identifier: Identifier.weeklyStyleDrop,
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request)
    }

    // MARK: - Re-engagement (72 hours after last app open)

    /// Call this on every app open to reschedule the 72-hour re-engagement notification.
    func scheduleReEngagementNotification() {
        let center = UNUserNotificationCenter.current()

        // Cancel any existing re-engagement notification first
        center.removePendingNotificationRequests(withIdentifiers: [Identifier.reEngagement])

        let content = UNMutableNotificationContent()
        content.title = "Your glow up is waiting"
        content.body = "See what new styles are available today."
        content.sound = .default

        // 72 hours = 259200 seconds
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 72 * 60 * 60, repeats: false)
        let request = UNNotificationRequest(
            identifier: Identifier.reEngagement,
            content: content,
            trigger: trigger
        )

        center.add(request)
    }

    // MARK: - Trial Ending Reminder (2 days after trial start)

    /// Schedule a reminder that the trial ends tomorrow. Call when trial begins.
    /// - Parameter trialStartDate: The date the trial started.
    func scheduleTrialEndingReminder(trialStartDate: Date) {
        let center = UNUserNotificationCenter.current()

        // Cancel any existing trial-ending notification
        center.removePendingNotificationRequests(withIdentifiers: [Identifier.trialEnding])

        let content = UNMutableNotificationContent()
        content.title = "Your free trial ends tomorrow"
        content.body = "Keep your premium access — your glow ups look amazing!"
        content.sound = .default

        // Fire 2 days after trial start
        let fireDate = Calendar.current.date(byAdding: .day, value: 2, to: trialStartDate) ?? trialStartDate
        let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: fireDate)
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)

        let request = UNNotificationRequest(
            identifier: Identifier.trialEnding,
            content: content,
            trigger: trigger
        )

        center.add(request)
    }

    // MARK: - Cancellation

    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
}
