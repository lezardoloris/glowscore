import UIKit
import Photos

actor ImageService {
    static let shared = ImageService()
    private init() {}

    func saveToPhotoLibrary(_ image: UIImage) async throws {
        try await PHPhotoLibrary.shared().performChanges {
            PHAssetChangeRequest.creationRequestForAsset(from: image)
        }
    }

    func saveTransformationLocally(original: UIImage, result: UIImage) throws -> (originalPath: String, resultPath: String) {
        let documentsDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let transformationsDir = documentsDir.appendingPathComponent("transformations", isDirectory: true)
        try FileManager.default.createDirectory(at: transformationsDir, withIntermediateDirectories: true)
        let id = UUID().uuidString
        let originalPath = transformationsDir.appendingPathComponent("\(id)_original.jpg")
        let resultPath = transformationsDir.appendingPathComponent("\(id)_result.jpg")
        try original.jpegData(compressionQuality: 0.85)?.write(to: originalPath)
        try result.jpegData(compressionQuality: 0.85)?.write(to: resultPath)
        return (originalPath.path, resultPath.path)
    }
}
