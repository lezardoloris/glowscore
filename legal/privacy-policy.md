# GlowScore Privacy Policy

Last updated: 2026-06-15. This document is the source for the hosted privacy policy URL required by the App Store. Style: plain language, no dashes.

## Summary (plain language)
GlowScore analyzes a selfie you provide to give you wellness and styling insights (skin, glow-up, color, de-puff). Your photo is processed by AI and is **automatically deleted within 48 hours**. We never sell your photos and never use them to train AI models. GlowScore is for wellness and entertainment. It is not a medical device, diagnosis, or treatment. You must be 17 or older.

## What we collect
- **Face photos you submit (biometric data).** Used only to generate your requested analysis or AI visualization.
- **Quiz answers** (skin type, sleep, goals, cycle phase, etc.). Stored on your device; used to personalize your plan.
- **Subscription status** via RevenueCat (to unlock premium features). No payment card data is stored by us.
- **Basic analytics** (screen views, feature taps), no facial data attached.

## How your photo is processed
When you run a scan or transformation, your photo is sent over an encrypted connection to our backend (Cloudflare Worker) and to AI sub-processors to produce the result, then the cached image is deleted.

### Sub-processors
- **Google (Gemini / "Nano Banana" image model)** — image analysis and identity-preserving visualization.
- **fal.ai** — image generation fallback.
- **OpenRouter** — vision language model for scoring.
- **Cloudflare (Workers + R2)** — request handling and temporary image cache (auto-deleted, see retention).
- **RevenueCat** — subscription entitlement validation.

We require each sub-processor to process data only on our instructions and not to use your images to train their models.

## Retention and deletion
- Cached face images are **auto-deleted within 48 hours** by a scheduled cleanup job. Most are deleted within minutes of producing your result.
- Quiz answers and scan history are stored **locally on your device** and removed when you delete the app or use in-app account deletion.
- **Your rights (GDPR / CCPA / BIPA):** you can request access to or deletion of your data at any time via in-app account deletion or by contacting us. We do not sell personal information.

## Biometric notice (BIPA and similar US state laws)
Face geometry derived from your selfie is biometric information. By granting AI consent at onboarding, you consent to this processing for the sole purpose of generating your requested results, with the retention and deletion terms above. We do not disclose biometric information to third parties except the sub-processors listed, and we never sell it.

## Minors
GlowScore is intended for users **17 and older**. We do not knowingly collect data from anyone under 17. Facial scoring features are gated behind an age confirmation.

## Not medical advice
GlowScore provides wellness, skincare, and styling guidance for general informational and entertainment purposes. It is not a medical device and does not diagnose, treat, or prevent any condition. Consult a qualified professional (dermatologist, physician) for medical concerns. If you are struggling with body image, support is available (e.g. NEDA, nationaleatingdisorders.org).

## Security
Encrypted transit (HTTPS), short-lived cached storage, signed image URLs, and an app-token gate on the API. No system is perfectly secure, but we minimize what we keep and how long we keep it.

## Contact
Privacy requests: [your support email]. Data controller: LUMINADEUS LLC.
