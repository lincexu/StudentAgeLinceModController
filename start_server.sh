#!/bin/bash

# Student Age Mod Compatibility Analysis Tool
# https://github.com/lincexu/StudentAgeLinceModController

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 not found. Please install Python 3.6+ first."
    read -p "Press Enter to exit..." -n 1 -r
    exit 1
fi

# Ensure script has execution permission
chmod +x start_server.py 2>/dev/null || true

# Start Python server
python3 start_server.py
