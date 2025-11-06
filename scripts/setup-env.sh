#!/bin/bash

# Environment Setup Script
# Helps set up environment variables for deployment

echo "🔐 Environment Variables Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo ""
echo "Please enter your environment variables:"
echo ""

# Supabase URL
read -p "NEXT_PUBLIC_SUPABASE_URL: " supabase_url
# Supabase Anon Key
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " supabase_key
# Admin Username
read -p "ADMIN_USERNAME: " admin_user
# Admin Password (hidden)
read -sp "ADMIN_PASSWORD: " admin_pass
echo ""

# Create .env.local
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key

# Admin Authentication
ADMIN_USERNAME=$admin_user
ADMIN_PASSWORD=$admin_pass
EOF

echo ""
echo "✅ .env.local created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review .env.local to ensure values are correct"
echo "2. Never commit .env.local to Git (already in .gitignore)"
echo "3. Add these same variables to your deployment platform"
echo ""

