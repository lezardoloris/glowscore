import Foundation

struct StylePreset: Identifiable, Codable {
    let id: String
    let name: String
    let presetDescription: String
    let icon: String
    let prompt: String
    let negativePrompt: String
    let ipAdapterScale: Double
    let isNew: Bool
    let isPremium: Bool

    static let defaults: [StylePreset] = [
        StylePreset(
            id: "clear_skin",
            name: "Clear Skin",
            presetDescription: "Flawless, even skin tone with natural glow",
            icon: "sparkles",
            prompt: "beautiful portrait, clear flawless skin, even skin tone, natural glow, soft studio lighting, professional photography",
            negativePrompt: "blemishes, acne, redness, blurry, deformed, low quality",
            ipAdapterScale: 0.85,
            isNew: false,
            isPremium: false
        ),
        StylePreset(
            id: "model_look",
            name: "Model Look",
            presetDescription: "High-fashion editorial style transformation",
            icon: "star.fill",
            prompt: "high fashion editorial portrait, professional model, perfect lighting, vogue magazine cover, glamorous, confident",
            negativePrompt: "amateur, blurry, deformed, low quality, bad lighting",
            ipAdapterScale: 0.75,
            isNew: false,
            isPremium: false
        ),
        StylePreset(
            id: "hair_makeover",
            name: "Hair Makeover",
            presetDescription: "Try different hairstyles and colors",
            icon: "scissors",
            prompt: "beautiful portrait with stylish modern haircut, salon quality hair, volumized shiny hair, professional hairstyling",
            negativePrompt: "messy hair, bad haircut, blurry, deformed, low quality",
            ipAdapterScale: 0.70,
            isNew: false,
            isPremium: false
        ),
        StylePreset(
            id: "age_rewind",
            name: "Age Rewind",
            presetDescription: "See your younger self",
            icon: "clock.arrow.circlepath",
            prompt: "youthful portrait, young looking skin, vibrant, energetic, natural beauty, warm lighting, 20 years old appearance",
            negativePrompt: "wrinkles, aging, tired, blurry, deformed, low quality",
            ipAdapterScale: 0.80,
            isNew: false,
            isPremium: false
        ),
        StylePreset(
            id: "fit_version",
            name: "Fit Version",
            presetDescription: "Visualize your fitness goals",
            icon: "figure.run",
            prompt: "fit healthy portrait, athletic build, toned, healthy glow, active lifestyle, natural lighting, confident posture",
            negativePrompt: "unhealthy, blurry, deformed, low quality, extreme",
            ipAdapterScale: 0.70,
            isNew: false,
            isPremium: false
        ),
        StylePreset(
            id: "celebrity_glam",
            name: "Celebrity Glam",
            presetDescription: "Red carpet ready",
            icon: "star.circle.fill",
            prompt: "glamorous celebrity portrait, red carpet ready, perfect makeup, designer styling, paparazzi photography, A-list celebrity, flawless skin, dramatic lighting",
            negativePrompt: "casual, amateur, blurry, deformed, low quality, bad makeup",
            ipAdapterScale: 0.75,
            isNew: true,
            isPremium: false
        ),
        StylePreset(
            id: "vintage_retro",
            name: "Vintage Retro",
            presetDescription: "Classic film star look",
            icon: "camera.fill",
            prompt: "classic Hollywood portrait, vintage film star look, 1950s glamour, black and white film aesthetic with warm tones, elegant, timeless beauty, soft focus",
            negativePrompt: "modern, digital, blurry, deformed, low quality, harsh lighting",
            ipAdapterScale: 0.75,
            isNew: true,
            isPremium: false
        ),
        StylePreset(
            id: "cyberpunk",
            name: "Cyberpunk",
            presetDescription: "Neon future aesthetic",
            icon: "globe.americas.fill",
            prompt: "futuristic cyberpunk portrait, neon lighting, holographic accents, sci-fi aesthetic, electric blue and pink neon glow, high tech, chrome reflections, blade runner style",
            negativePrompt: "natural, organic, blurry, deformed, low quality, daylight",
            ipAdapterScale: 0.70,
            isNew: true,
            isPremium: false
        )
    ]
}
