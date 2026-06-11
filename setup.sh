#!/bin/bash
# GlowUp AI — One-Command Setup Script
# Run this on macOS: chmod +x setup.sh && ./setup.sh

set -e
echo "🚀 Setting up GlowUp AI..."

# 1. Install XcodeGen if missing
if ! command -v xcodegen &> /dev/null; then
    echo "📦 Installing XcodeGen..."
    brew install xcodegen
fi

# 2. Generate Xcode project from project.yml
echo "🔨 Generating Xcode project..."
xcodegen generate
echo "✅ GlowUpAI.xcodeproj created"

# 3. Install Cloudflare Worker dependencies
echo "☁️ Setting up Cloudflare Worker..."
cd CloudflareWorker
npm install
cd ..
echo "✅ Worker dependencies installed"

# 4. Resolve SPM dependencies
echo "📦 Resolving Swift Package dependencies..."
xcodebuild -resolvePackageDependencies -project GlowUpAI.xcodeproj -scheme GlowUpAI 2>/dev/null || echo "⚠️ SPM resolution requires Xcode open — will resolve on first build"

echo ""
echo "============================================"
echo "✅ GlowUp AI setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. open GlowUpAI.xcodeproj"
echo "  2. Set your Team in Signing & Capabilities"
echo "  3. Edit GlowUpAI/App/Configuration.swift with your API keys:"
echo "     - RevenueCat API key"
echo "     - Cloudflare Worker URL (after deploying)"
echo "  4. Build & Run (⌘R) on simulator"
echo ""
echo "To deploy the Cloudflare Worker:"
echo "  cd CloudflareWorker"
echo "  wrangler login"
echo "  wrangler secret put FAL_API_KEY"
echo "  wrangler secret put REVENUECAT_API_KEY"
echo "  wrangler deploy"
echo ""
echo "🎉 Happy building!"
