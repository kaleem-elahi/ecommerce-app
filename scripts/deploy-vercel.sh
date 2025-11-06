#!/bin/bash

# Deploy to Vercel Script
# Makes deployment easier by automating common tasks

echo "🚀 The Agate City Website Deployment Script"
echo "====================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes."
    read -p "Do you want to commit them? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        git push
    fi
fi

# Check environment variables
echo ""
echo "📋 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Please create .env.local with required variables."
    exit 1
fi

# Ask deployment type
echo ""
echo "Select deployment type:"
echo "1) Preview (test deployment)"
echo "2) Production"
read -p "Enter choice (1 or 2): " deploy_type

if [ "$deploy_type" = "2" ]; then
    echo ""
    echo "🚀 Deploying to PRODUCTION..."
    vercel --prod
else
    echo ""
    echo "🔍 Creating PREVIEW deployment..."
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Visit the deployment URL shown above"
echo "2. Test your application"
echo "3. Set up environment variables in Vercel dashboard if not already done"
echo "4. Configure custom domain (optional)"
echo ""

