import Foundation
import SwiftUI

struct Transformation: Identifiable, Codable {
    let id: UUID
    let stylePresetId: String
    let originalImagePath: String
    let transformedImagePath: String
    let isHD: Bool
    let createdAt: Date

    init(stylePresetId: String, originalImagePath: String, transformedImagePath: String, isHD: Bool) {
        self.id = UUID()
        self.stylePresetId = stylePresetId
        self.originalImagePath = originalImagePath
        self.transformedImagePath = transformedImagePath
        self.isHD = isHD
        self.createdAt = Date()
    }
}

// H4 FIX: Singleton to prevent multiple instances racing on UserDefaults
@Observable
class TransformationHistory {
    static let shared = TransformationHistory()
    private(set) var transformations: [Transformation] = []
    private let storageKey = "transformation_history"
    private let maxHistory = 100

    private init() {
        load()
    }

    func add(_ transformation: Transformation) {
        transformations.insert(transformation, at: 0)
        // Cap history size to prevent UserDefaults bloat
        if transformations.count > maxHistory {
            let removed = Array(transformations.suffix(from: maxHistory))
            transformations = Array(transformations.prefix(maxHistory))
            for item in removed {
                try? FileManager.default.removeItem(atPath: item.originalImagePath)
                try? FileManager.default.removeItem(atPath: item.transformedImagePath)
            }
        }
        save()
    }

    func delete(_ transformation: Transformation) {
        transformations.removeAll { $0.id == transformation.id }
        // Clean up image files
        let fm = FileManager.default
        try? fm.removeItem(atPath: transformation.originalImagePath)
        try? fm.removeItem(atPath: transformation.transformedImagePath)
        save()
    }

    // H10 FIX: GDPR delete all data
    func deleteAll() {
        for item in transformations {
            try? FileManager.default.removeItem(atPath: item.originalImagePath)
            try? FileManager.default.removeItem(atPath: item.transformedImagePath)
        }
        transformations.removeAll()
        save()
    }

    private func save() {
        if let data = try? JSONEncoder().encode(transformations) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([Transformation].self, from: data) else { return }
        transformations = decoded
    }
}
