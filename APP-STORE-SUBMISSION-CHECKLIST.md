# GlowUp AI — App Store Submission Checklist

## Pre-Submission (Do These First)

### 1. Accounts & Configuration
- [ ] Apple Developer Program enrolled ($99/year) — developer.apple.com
- [ ] App Store Connect: Create app listing (My Apps → +)
- [ ] RevenueCat: Create project, configure iOS app, get production API key
- [ ] RevenueCat: Create entitlement `glowup_premium`
- [ ] RevenueCat: Create offerings with Weekly ($4.99) and Annual ($29.99) packages
- [ ] App Store Connect: Create subscription group "GlowUp Pro"
- [ ] App Store Connect: Create IAP products `glowup_weekly_499` and `glowup_annual_2999`
- [ ] App Store Connect: Set free trial (3 days) on weekly plan
- [ ] Cloudflare: Deploy Worker to production domain
- [ ] Cloudflare: Set secrets — `FAL_API_KEY`, `REVENUECAT_API_KEY`
- [ ] Cloudflare: Create KV namespace for rate limiting
- [ ] fal.ai: Fund account, verify API key is active

### 2. API Keys in Xcode
- [ ] Create `Config/Release.local.xcconfig` with real keys:
  ```
  REVENUECAT_API_KEY = appl_YOUR_REAL_KEY
  WORKER_BASE_URL = https:\/\/glowup-api.your-domain.workers.dev
  ```
- [ ] In Xcode: Project → Build Settings → set Debug.xcconfig and Release.xcconfig
- [ ] Verify: Build in Release mode, app connects to real Worker endpoint
- [ ] Verify: RevenueCat SDK initializes without error in console

### 3. Legal Pages (Must Be Live URLs)
- [ ] Host `legal/privacy-policy.html` at `https://glowupai.app/privacy`
- [ ] Host `legal/terms-of-service.html` at `https://glowupai.app/terms`
- [ ] Verify both URLs load correctly in Safari
- [ ] Add Privacy URL to App Store Connect
- [ ] Add Support URL to App Store Connect

### 4. Certificates & Profiles
- [ ] Create iOS Distribution Certificate (Keychain Access → Certificate Assistant)
- [ ] Create App ID: `com.glowupai.app` in Apple Developer Portal
- [ ] Enable capabilities: Push Notifications, In-App Purchase
- [ ] Create Distribution Provisioning Profile linked to App ID
- [ ] Download and install profile in Xcode

### 5. Xcode Project Settings
- [ ] Bundle ID: `com.glowupai.app`
- [ ] Version: `1.0.0`
- [ ] Build: `1`
- [ ] Deployment target: iOS 18.0+
- [ ] Device: iPhone only (iPad support can come later)
- [ ] Signing: Automatic, Team = your Apple Developer team
- [ ] Capabilities: In-App Purchase, Push Notifications

---

## Testing (Before Archive)

### 6. Device Testing
- [ ] Test on physical iPhone (not just Simulator)
- [ ] Test complete flow: Launch → Onboarding → Camera → Style → Processing → Result → Share
- [ ] Test free tier: On-device preview generates, watermark visible
- [ ] Test paywall: Appears after first preview, all legal text visible
- [ ] Test subscription: Purchase in Sandbox, verify HD works
- [ ] Test restore purchases
- [ ] Test face detection: Good selfie, no face, rear camera, landscape photo
- [ ] Test error states: Airplane mode during transform, camera denied
- [ ] Test history: Saves after transform, grid displays, delete works
- [ ] Test settings: Manage subscription link opens App Store, delete all data works
- [ ] Test dark mode: Forced correctly, no white flashes
- [ ] Test notifications: Alert appears, permission dialog shows after tapping "Yes"

### 7. Performance
- [ ] On-device preview completes in < 8 seconds
- [ ] Cloud HD completes in < 5 seconds (good network)
- [ ] Before/after slider is smooth at 60fps
- [ ] No memory leaks (run Instruments → Leaks)
- [ ] App launch < 2 seconds to interactive

---

## App Store Connect Setup

### 8. App Information
- [ ] App name: GlowUp AI
- [ ] Subtitle: AI Photo Transformations
- [ ] Category: Photo & Video
- [ ] Secondary category: Entertainment
- [ ] Age rating: Complete questionnaire → should result in 4+
- [ ] Price: Free
- [ ] Availability: All territories (or select specific ones)

### 9. App Store Listing
- [ ] Description: Copy from `legal/app-store-metadata.md`
- [ ] Keywords: `ai,glow up,selfie,beauty,transformation,photo editor,makeover,face,filter,style,before after`
- [ ] Promotional text: From metadata file
- [ ] What's New: From metadata file
- [ ] Support URL: `https://glowupai.app/support`
- [ ] Privacy Policy URL: `https://glowupai.app/privacy`

### 10. Screenshots (Required)
Upload for BOTH 6.7" (iPhone 15 Pro Max) and 6.1" (iPhone 15 Pro):
- [ ] Screenshot 1: "See Your Best Self" — before/after hero
- [ ] Screenshot 2: "5 Stunning Style Presets" — style grid
- [ ] Screenshot 3: "Instant Glow Up" — result with slider
- [ ] Screenshot 4: "Share Your Glow Up" — share screen
- [ ] Screenshot 5: "Free to Try" — features + pricing
- [ ] All screenshots show app in use (guideline 2.3.3)

### 11. App Preview Video (Optional but Recommended)
- [ ] 30-second video: Selfie → Style → Processing → Reveal → Share
- [ ] Record using screen capture on device
- [ ] Format: 1080x1920 (9:16), H.264, 30fps

### 12. Privacy Nutrition Labels
Complete in App Store Connect → App Privacy:
- [ ] Photos or Videos: Yes → App Functionality
- [ ] Purchases: Yes → App Functionality → Linked to User
- [ ] Usage Data: Yes → Analytics → Not Linked to User
- [ ] Identifiers: Yes → Analytics → Not Linked to User
- [ ] Diagnostics: Yes → Analytics → Not Linked to User

### 13. Review Notes
- [ ] Paste review notes from `legal/app-store-metadata.md`
- [ ] No demo account needed (subscription is the only gate)
- [ ] Explain that free tier works entirely on-device

---

## Archive & Submit

### 14. Build & Archive
- [ ] Select "Any iOS Device" as build target
- [ ] Set build configuration to Release
- [ ] Product → Archive
- [ ] Wait for archive to complete
- [ ] In Organizer: Validate App (fix any issues)
- [ ] In Organizer: Distribute App → App Store Connect
- [ ] Upload completes without errors

### 15. Submit for Review
- [ ] Return to App Store Connect
- [ ] Select the uploaded build
- [ ] Fill in any remaining fields
- [ ] Verify `ITSAppUsesNonExemptEncryption = NO` (already set in Info.plist)
- [ ] Click "Submit for Review"
- [ ] Expected review time: 1-3 days

---

## Post-Submission

### 16. While Waiting for Review
- [ ] Monitor status in App Store Connect
- [ ] Prepare social media launch posts
- [ ] Prepare 2 new style presets for first weekly drop
- [ ] Set up Cloudflare analytics dashboard
- [ ] Test push notification delivery end-to-end

### 17. After Approval
- [ ] Set release date (manual or automatic)
- [ ] Verify app appears on App Store
- [ ] Download from App Store, test fresh install flow
- [ ] Monitor Crashlytics for day-1 crashes
- [ ] Monitor RevenueCat for first subscriptions
- [ ] Respond to any App Store reviews within 24h

---

## Common Rejection Reasons to Avoid

| Reason | How We Prevent It |
|--------|-------------------|
| Missing subscription terms | Full disclosure on paywall + Settings |
| Missing privacy policy | Live URL + linked in paywall + Settings |
| Misleading metadata | No fake social proof, disclaimer on every result |
| Body image concerns | "Artistic visualization" language, never "improvement" |
| Incomplete binary | All features functional, no placeholders |
| Broken links | Terms/Privacy URLs must be live before submission |
| Missing restore purchases | Present on paywall + Settings |
