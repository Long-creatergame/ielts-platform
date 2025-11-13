#!/bin/bash

# Vercel Deployment Check Script
# Usage: VERCEL_TOKEN='your-token' ./check_vercel_deployments.sh

set -e

PROJECT_NAME="ielts-platform-two"
TARGET_COMMIT_SHORT="f732a56"
TARGET_COMMIT_FULL="732a5e61"
TARGET_MESSAGE="test: verify vercel auto-deploy hook"

echo "=== VERCEL DEPLOYMENT CHECK ==="
echo "Project: $PROJECT_NAME"
echo "Target Commit: $TARGET_COMMIT_SHORT / $TARGET_COMMIT_FULL"
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ ERROR: VERCEL_TOKEN not set"
    echo ""
    echo "To get your Vercel token:"
    echo "1. Go to: https://vercel.com/account/tokens"
    echo "2. Click 'Create Token'"
    echo "3. Copy the token"
    echo "4. Run: export VERCEL_TOKEN='your-token-here'"
    echo "5. Run this script again"
    exit 1
fi

echo "✅ VERCEL_TOKEN found"
echo ""

# Get project ID
echo "=== STEP 1: Getting Project ID ==="
PROJECT_INFO=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects?teamId=")

PROJECT_ID=$(echo "$PROJECT_INFO" | jq -r ".projects[] | select(.name==\"$PROJECT_NAME\") | .id" 2>/dev/null)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "null" ]; then
    echo "⚠️ Could not find project ID. Trying alternative method..."
    # Try with project name directly
    PROJECT_ID="$PROJECT_NAME"
fi

echo "Project ID: $PROJECT_ID"
echo ""

# Get deployments
echo "=== STEP 2: Fetching Deployments ==="
DEPLOYMENTS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=10")

echo "✅ Fetched deployments"
echo ""

# Check for matching commit
echo "=== STEP 3: Analyzing Deployments ==="
echo ""

MATCHING_DEPLOYMENT=$(echo "$DEPLOYMENTS" | jq -r \
    ".deployments[]? | select(.meta.githubCommitSha? | startswith(\"$TARGET_COMMIT_SHORT\") or startswith(\"$TARGET_COMMIT_FULL\")) | .uid" \
    2>/dev/null | head -1)

if [ -n "$MATCHING_DEPLOYMENT" ] && [ "$MATCHING_DEPLOYMENT" != "null" ]; then
    echo "✅ FOUND MATCHING DEPLOYMENT!"
    echo "Deployment UID: $MATCHING_DEPLOYMENT"
    echo ""
    
    # Get full deployment details
    DEPLOYMENT_DETAILS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v13/deployments/$MATCHING_DEPLOYMENT")
    
    STATE=$(echo "$DEPLOYMENT_DETAILS" | jq -r '.state' 2>/dev/null)
    CREATED=$(echo "$DEPLOYMENT_DETAILS" | jq -r '.createdAt' 2>/dev/null)
    URL=$(echo "$DEPLOYMENT_DETAILS" | jq -r '.url' 2>/dev/null)
    COMMIT_SHA=$(echo "$DEPLOYMENT_DETAILS" | jq -r '.meta.githubCommitSha' 2>/dev/null)
    COMMIT_MESSAGE=$(echo "$DEPLOYMENT_DETAILS" | jq -r '.meta.githubCommitMessage' 2>/dev/null)
    
    echo "=== DEPLOYMENT DETAILS ==="
    echo "Status: $STATE"
    echo "Created: $CREATED"
    echo "URL: https://$URL"
    echo "Commit SHA: $COMMIT_SHA"
    echo "Commit Message: $COMMIT_MESSAGE"
    echo ""
    
    case "$STATE" in
        "BUILDING")
            echo "⏳ Status: BUILDING - Deployment in progress"
            ;;
        "READY")
            echo "✅ Status: READY - Deployment successful!"
            echo "Production URL: https://$URL"
            ;;
        "ERROR"|"CANCELED")
            echo "❌ Status: $STATE - Deployment failed"
            ;;
        *)
            echo "⚠️ Status: $STATE - Unknown state"
            ;;
    esac
else
    echo "❌ NO MATCHING DEPLOYMENT FOUND"
    echo ""
    echo "Latest 10 deployments:"
    echo "$DEPLOYMENTS" | jq -r '.deployments[]? | "\(.uid) | \(.state) | \(.createdAt) | \(.meta.githubCommitSha // "N/A") | \(.url)"' 2>/dev/null | head -10
    echo ""
    echo "=== TROUBLESHOOTING ==="
    echo "1. Check GitHub webhook:"
    echo "   https://github.com/Long-creatergame/ielts-platform/settings/webhooks"
    echo ""
    echo "2. Check Vercel Auto-Deploy settings:"
    echo "   https://vercel.com/dashboard -> Project -> Settings -> Git"
    echo ""
    echo "3. Manual redeploy:"
    echo "   Vercel Dashboard -> Deployments -> Create Deployment"
fi

echo ""
echo "=== SCRIPT COMPLETE ==="

