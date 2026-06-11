import Foundation

final class UsageMeter {
    static let shared = UsageMeter()
    private let defaults = UserDefaults.standard
    private let hdCountKey = "hd_generation_count"
    private let hdDateKey = "hd_generation_date"
    private let freeCountKey = "free_transform_count"
    private let freeDateKey = "free_transform_date"

    /// Check if HD generation is allowed (subscriber, max 10/day)
    var canGenerateHD: Bool {
        resetIfNewDay(countKey: hdCountKey, dateKey: hdDateKey)
        let count = defaults.integer(forKey: hdCountKey)
        return count < Configuration.maxHDTransformsPerDay
    }

    /// Check if free standard transform is allowed (5/day for free users)
    var canGeneratePreview: Bool {
        resetIfNewDay(countKey: freeCountKey, dateKey: freeDateKey)
        let count = defaults.integer(forKey: freeCountKey)
        return count < Configuration.maxFreeTransformsPerDay
    }

    /// Record an HD generation
    func recordHDGeneration() {
        resetIfNewDay(countKey: hdCountKey, dateKey: hdDateKey)
        let count = defaults.integer(forKey: hdCountKey)
        defaults.set(count + 1, forKey: hdCountKey)
    }

    /// Record a free standard transform
    func recordPreviewGeneration() {
        resetIfNewDay(countKey: freeCountKey, dateKey: freeDateKey)
        let count = defaults.integer(forKey: freeCountKey)
        defaults.set(count + 1, forKey: freeCountKey)
    }

    /// Remaining HD generations today
    var remainingHD: Int {
        resetIfNewDay(countKey: hdCountKey, dateKey: hdDateKey)
        return max(0, Configuration.maxHDTransformsPerDay - defaults.integer(forKey: hdCountKey))
    }

    /// Remaining free standard transforms today
    var remainingPreviews: Int {
        resetIfNewDay(countKey: freeCountKey, dateKey: freeDateKey)
        return max(0, Configuration.maxFreeTransformsPerDay - defaults.integer(forKey: freeCountKey))
    }

    private func resetIfNewDay(countKey: String, dateKey: String) {
        let today = Calendar.current.startOfDay(for: Date())
        let lastDate = defaults.object(forKey: dateKey) as? Date ?? .distantPast

        if Calendar.current.startOfDay(for: lastDate) < today {
            defaults.set(0, forKey: countKey)
            defaults.set(today, forKey: dateKey)
        }
    }
}
