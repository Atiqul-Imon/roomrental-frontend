#!/bin/bash

# Performance Testing Script for RoomRental Frontend
# This script helps test performance improvements locally

set -e

COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}=================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}  Performance Testing Toolkit   ${COLOR_RESET}"
echo -e "${COLOR_BLUE}=================================${COLOR_RESET}"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
  echo -e "${COLOR_RED}Error: This script must be run from the frontend directory${COLOR_RESET}"
  exit 1
fi

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Menu
echo "Select an option:"
echo "1) Analyze bundle size"
echo "2) Build and check output"
echo "3) Run Lighthouse (local)"
echo "4) Run Lighthouse CI"
echo "5) Check for unused dependencies"
echo "6) Start dev server"
echo "7) Full performance audit"
echo "8) Exit"
echo ""
read -p "Enter your choice (1-8): " choice

case $choice in
  1)
    echo -e "\n${COLOR_YELLOW}Running bundle analyzer...${COLOR_RESET}"
    echo "This will build the app and open the bundle analyzer in your browser."
    ANALYZE=true npm run build
    ;;
    
  2)
    echo -e "\n${COLOR_YELLOW}Building application...${COLOR_RESET}"
    npm run build
    echo -e "\n${COLOR_GREEN}Build complete!${COLOR_RESET}"
    echo -e "\n${COLOR_BLUE}Analyzing output:${COLOR_RESET}"
    
    # Check .next folder
    if [ -d ".next" ]; then
      echo -e "\n${COLOR_YELLOW}JavaScript chunks:${COLOR_RESET}"
      ls -lh .next/static/chunks/*.js 2>/dev/null | awk '{print $5, $9}' | sort -hr | head -10
      
      echo -e "\n${COLOR_YELLOW}Total size of chunks:${COLOR_RESET}"
      du -sh .next/static/chunks/
      
      echo -e "\n${COLOR_YELLOW}CSS files:${COLOR_RESET}"
      ls -lh .next/static/css/*.css 2>/dev/null | awk '{print $5, $9}' || echo "No CSS files found"
    fi
    ;;
    
  3)
    echo -e "\n${COLOR_YELLOW}Running Lighthouse audit...${COLOR_RESET}"
    
    # Check if lighthouse is installed
    if ! command_exists lighthouse; then
      echo -e "${COLOR_RED}Lighthouse is not installed.${COLOR_RESET}"
      read -p "Install it now? (y/n): " install_choice
      if [ "$install_choice" = "y" ]; then
        npm install -g lighthouse
      else
        exit 1
      fi
    fi
    
    # Check if server is running
    if ! curl -s http://localhost:3000 > /dev/null; then
      echo -e "${COLOR_YELLOW}Starting development server...${COLOR_RESET}"
      npm run dev &
      SERVER_PID=$!
      sleep 10
    fi
    
    echo -e "${COLOR_GREEN}Running Lighthouse...${COLOR_RESET}"
    lighthouse http://localhost:3000 \
      --view \
      --output html \
      --output-path ./lighthouse-report.html \
      --chrome-flags="--headless"
    
    if [ ! -z "$SERVER_PID" ]; then
      kill $SERVER_PID
    fi
    ;;
    
  4)
    echo -e "\n${COLOR_YELLOW}Running Lighthouse CI...${COLOR_RESET}"
    
    if ! command_exists lhci; then
      echo -e "${COLOR_RED}Lighthouse CI is not installed.${COLOR_RESET}"
      read -p "Install it now? (y/n): " install_choice
      if [ "$install_choice" = "y" ]; then
        npm install -g @lhci/cli
      else
        exit 1
      fi
    fi
    
    # Build the app
    echo -e "${COLOR_YELLOW}Building app...${COLOR_RESET}"
    npm run build
    
    # Start the server
    echo -e "${COLOR_YELLOW}Starting server...${COLOR_RESET}"
    npm start &
    SERVER_PID=$!
    sleep 5
    
    # Run LHCI
    lhci autorun
    
    # Stop server
    kill $SERVER_PID
    ;;
    
  5)
    echo -e "\n${COLOR_YELLOW}Checking for unused dependencies...${COLOR_RESET}"
    
    if ! command_exists depcheck; then
      echo -e "${COLOR_YELLOW}Installing depcheck...${COLOR_RESET}"
      npx depcheck
    else
      depcheck
    fi
    ;;
    
  6)
    echo -e "\n${COLOR_YELLOW}Starting development server...${COLOR_RESET}"
    npm run dev
    ;;
    
  7)
    echo -e "\n${COLOR_YELLOW}Running full performance audit...${COLOR_RESET}"
    echo -e "${COLOR_BLUE}This will:${COLOR_RESET}"
    echo "1. Check for unused dependencies"
    echo "2. Build the application"
    echo "3. Analyze bundle size"
    echo "4. Run Lighthouse audit"
    echo ""
    read -p "Continue? (y/n): " continue_choice
    
    if [ "$continue_choice" != "y" ]; then
      exit 0
    fi
    
    # Step 1: Check dependencies
    echo -e "\n${COLOR_BLUE}[1/4] Checking dependencies...${COLOR_RESET}"
    if command_exists depcheck; then
      depcheck
    else
      npx depcheck
    fi
    
    # Step 2: Build
    echo -e "\n${COLOR_BLUE}[2/4] Building application...${COLOR_RESET}"
    npm run build
    
    # Step 3: Analyze
    echo -e "\n${COLOR_BLUE}[3/4] Analyzing bundle...${COLOR_RESET}"
    if [ -d ".next" ]; then
      echo -e "\n${COLOR_YELLOW}Top 10 largest chunks:${COLOR_RESET}"
      ls -lh .next/static/chunks/*.js 2>/dev/null | awk '{print $5, $9}' | sort -hr | head -10
      
      echo -e "\n${COLOR_YELLOW}Total bundle size:${COLOR_RESET}"
      du -sh .next/
    fi
    
    # Step 4: Lighthouse
    echo -e "\n${COLOR_BLUE}[4/4] Running Lighthouse...${COLOR_RESET}"
    npm start &
    SERVER_PID=$!
    sleep 5
    
    if command_exists lighthouse; then
      lighthouse http://localhost:3000 \
        --view \
        --output html \
        --output json \
        --output-path ./lighthouse-report.html
    else
      echo -e "${COLOR_YELLOW}Lighthouse not installed. Skipping...${COLOR_RESET}"
    fi
    
    kill $SERVER_PID
    
    echo -e "\n${COLOR_GREEN}Full audit complete!${COLOR_RESET}"
    ;;
    
  8)
    echo -e "${COLOR_GREEN}Exiting...${COLOR_RESET}"
    exit 0
    ;;
    
  *)
    echo -e "${COLOR_RED}Invalid option${COLOR_RESET}"
    exit 1
    ;;
esac

echo -e "\n${COLOR_GREEN}Done!${COLOR_RESET}"
