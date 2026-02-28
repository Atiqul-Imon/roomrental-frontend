#!/bin/bash

# Robots.txt Validation Script
# Checks if robots.txt is valid and doesn't contain invalid directives

set -e

COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}=================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}  Robots.txt Validator          ${COLOR_RESET}"
echo -e "${COLOR_BLUE}=================================${COLOR_RESET}"
echo ""

# Check local or production
read -p "Check [L]ocal or [P]roduction? (L/P): " choice

if [[ "$choice" == "L" || "$choice" == "l" ]]; then
  URL="http://localhost:3000/robots.txt"
  echo -e "${COLOR_YELLOW}Checking local robots.txt...${COLOR_RESET}"
else
  URL="https://www.roomrentalusa.com/robots.txt"
  echo -e "${COLOR_YELLOW}Checking production robots.txt...${COLOR_RESET}"
fi

echo -e "URL: $URL"
echo ""

# Fetch robots.txt
ROBOTS_CONTENT=$(curl -s "$URL")

if [ -z "$ROBOTS_CONTENT" ]; then
  echo -e "${COLOR_RED}❌ Error: Could not fetch robots.txt${COLOR_RESET}"
  exit 1
fi

echo -e "${COLOR_BLUE}Robots.txt Content:${COLOR_RESET}"
echo "---"
echo "$ROBOTS_CONTENT"
echo "---"
echo ""

# Validate - check for invalid directives
echo -e "${COLOR_YELLOW}Running validation checks...${COLOR_RESET}"
echo ""

ERRORS=0

# Check for invalid Content-Signal directive
if echo "$ROBOTS_CONTENT" | grep -qi "Content-Signal"; then
  echo -e "${COLOR_RED}❌ FAIL: Invalid 'Content-Signal' directive found${COLOR_RESET}"
  echo "   This is a Cloudflare-injected directive that's not part of robots.txt spec"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${COLOR_GREEN}✅ PASS: No 'Content-Signal' directive${COLOR_RESET}"
fi

# Check for excessive comments (Cloudflare injection)
COMMENT_COUNT=$(echo "$ROBOTS_CONTENT" | grep -c "^#" || true)
if [ "$COMMENT_COUNT" -gt 5 ]; then
  echo -e "${COLOR_YELLOW}⚠️  WARN: Found $COMMENT_COUNT comment lines (might be Cloudflare injection)${COLOR_RESET}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${COLOR_GREEN}✅ PASS: Reasonable number of comments ($COMMENT_COUNT)${COLOR_RESET}"
fi

# Check for User-agent directive
if echo "$ROBOTS_CONTENT" | grep -qi "User-agent"; then
  echo -e "${COLOR_GREEN}✅ PASS: User-agent directive present${COLOR_RESET}"
else
  echo -e "${COLOR_RED}❌ FAIL: No User-agent directive found${COLOR_RESET}"
  ERRORS=$((ERRORS + 1))
fi

# Check for Sitemap
if echo "$ROBOTS_CONTENT" | grep -qi "Sitemap"; then
  SITEMAP_URL=$(echo "$ROBOTS_CONTENT" | grep -i "Sitemap" | head -1 | cut -d':' -f2- | tr -d ' ')
  echo -e "${COLOR_GREEN}✅ PASS: Sitemap directive present${COLOR_RESET}"
  echo -e "   URL: $SITEMAP_URL"
else
  echo -e "${COLOR_YELLOW}⚠️  WARN: No Sitemap directive found${COLOR_RESET}"
fi

# Check for valid directives only
echo ""
echo -e "${COLOR_YELLOW}Checking for invalid directives...${COLOR_RESET}"

# Valid directives: User-agent, Allow, Disallow, Crawl-delay, Sitemap
INVALID_DIRECTIVES=$(echo "$ROBOTS_CONTENT" | grep -v "^#" | grep -v "^$" | grep ":" | grep -viE "^(User-agent|Allow|Disallow|Crawl-delay|Sitemap)" || true)

if [ ! -z "$INVALID_DIRECTIVES" ]; then
  echo -e "${COLOR_RED}❌ FAIL: Found invalid directives:${COLOR_RESET}"
  echo "$INVALID_DIRECTIVES"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${COLOR_GREEN}✅ PASS: All directives are valid${COLOR_RESET}"
fi

# Check for Cloudflare markers
if echo "$ROBOTS_CONTENT" | grep -qi "Cloudflare"; then
  echo -e "${COLOR_YELLOW}⚠️  WARN: Cloudflare injection detected${COLOR_RESET}"
  echo "   Action required: Disable Cloudflare robots.txt injection"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${COLOR_GREEN}✅ PASS: No Cloudflare injection${COLOR_RESET}"
fi

# Summary
echo ""
echo "================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${COLOR_GREEN}✅ Robots.txt is VALID${COLOR_RESET}"
  echo -e "${COLOR_GREEN}No issues found!${COLOR_RESET}"
  exit 0
else
  echo -e "${COLOR_RED}❌ Robots.txt has $ERRORS issue(s)${COLOR_RESET}"
  echo ""
  echo "Action items:"
  echo "1. Fix invalid directives in robots.ts"
  echo "2. Disable Cloudflare robots.txt injection"
  echo "3. Deploy and verify again"
  exit 1
fi
