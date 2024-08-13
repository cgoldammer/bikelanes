#!/bin/zsh

# Step 1: Go to ~/Downloads
cd ~/Downloads

# Step 2: Find the most recently created file matching "data*.json"
latest_file=$(ls -t data*.json | head -n 1)

# Step 3: Copy the file to $CD_BIKE/app/src/data/data.json
if [ -n "$latest_file" ]; then
  cp "$latest_file" "$CD_BIKE/app/src/data/data.json"
  echo "Copied $latest_file to $CD_BIKE/app/src/data/data.json"
else
  echo "No file matching 'data*.json' found in ~/Downloads."
fi
