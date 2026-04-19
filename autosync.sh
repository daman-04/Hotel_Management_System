#!/bin/bash
# Autosync script to watch and push changes to GitHub

echo "[HostelMS] Starting Auto-Sync to GitHub (every 30s)..."

while true; do
  git add .
  if ! git diff-index --quiet HEAD; then
    commit_msg="Auto-sync update: $(date)"
    git commit -m "$commit_msg"
    git push origin main
    echo "[HostelMS] Changes synced to GitHub at $(date)"
  fi
  sleep 30
done
