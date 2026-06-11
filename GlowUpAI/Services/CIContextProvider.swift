import CoreImage

final class CIContextProvider {
    static let shared = CIContextProvider()

    lazy var context: CIContext = {
        CIContext(options: [.useSoftwareRenderer: false])
    }()

    private init() {}
}
