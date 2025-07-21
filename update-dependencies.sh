#!/bin/bash

# Function to check updates
check_updates() {
    echo "🔍 Checking for updates..."
    npm run check-updates
    echo "🔍 Checking frontend updates..."
    npm run check-updates:frontend
    echo "🔍 Checking backend updates..."
    npm run check-updates:backend
}

# Function to update all dependencies
update_all() {
    echo "📦 Updating all dependencies..."
    npm run update-all
}

# Function to update frontend dependencies
update_frontend() {
    echo "📦 Updating frontend dependencies..."
    npm run update-frontend
}

# Function to update backend dependencies
update_backend() {
    echo "📦 Updating backend dependencies..."
    npm run update-backend
}

# Function to check for security vulnerabilities
check_vulnerabilities() {
    echo "🛡️ Checking for security vulnerabilities..."
    npm audit
}

# Main script logic
echo "Dependency Update Script"
echo "======================="

echo "1. Check updates"
echo "2. Update all dependencies"
echo "3. Update frontend dependencies"
echo "4. Update backend dependencies"
echo "5. Check security vulnerabilities"
echo "6. Exit"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        check_updates
        ;;
    2)
        update_all
        ;;
    3)
        update_frontend
        ;;
    4)
        update_backend
        ;;
    5)
        check_vulnerabilities
        ;;
    6)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Please try again."
        exit 1
        ;;
esac

# After update, show status
echo "\nUpdate complete!"
echo "================="
echo "\nCurrent dependency status:"
npm list --depth=0