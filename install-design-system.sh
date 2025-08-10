#!/bin/bash

echo "🎨 Installing Garage Management System Design Blueprint..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Run the installation script
node install-design-system.js

echo
echo "✅ Installation complete!"
echo
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Visit: /dev/component-showcase"
echo "3. Check the new design system components" 