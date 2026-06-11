# GlowUp AI

AI-powered photo transformation app. Upload a selfie, get your "glow up" version.

## Setup

1. Open `GlowUpAI.xcodeproj` in Xcode (or create a new Xcode project and add these files)
2. Set deployment target to iOS 16.0
3. Add your API keys in `App/Constants.swift`
4. Add SPM dependencies:
   - RevenueCat: `https://github.com/RevenueCat/purchases-ios-spm.git`
   - Supabase: `https://github.com/supabase-community/supabase-swift.git`
5. Build and run

## Xcode Project Setup

Since this project was scaffolded without Xcode, create the project:

1. Open Xcode → File → New → Project → iOS → App
2. Product Name: `GlowUpAI`
3. Interface: SwiftUI, Language: Swift
4. Minimum Deployments: iOS 16.0
5. Delete the auto-generated `ContentView.swift` and `GlowUpAIApp.swift`
6. Drag the `GlowUpAI/` source folder into the Xcode project navigator
7. Ensure `Info.plist` is linked in Build Settings
8. Add the SPM dependencies listed above

## Architecture

- **App/** — Entry point, global state, constants
- **Features/** — Screen-level views organized by feature
- **Services/** — API integrations (Replicate AI, RevenueCat, Supabase)
- **Models/** — Data models
- **Components/** — Reusable UI components
- **Extensions/** — Swift extensions

## API Keys Required

- Replicate API key (for AI transformations)
- RevenueCat API key (for subscriptions)
- Supabase URL + anon key (for backend)
