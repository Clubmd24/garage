#!/usr/bin/env bash
set -e

# Load nvm if installed, otherwise install it
if ! command -v nvm >/dev/null 2>&1; then
  echo "nvm not found, installing..."
  if curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash; then
    echo "nvm installed via network"
  else
    echo "Failed to download nvm. Checking for local copy..."
    if [ -f scripts/nvm-install.sh ]; then
      bash scripts/nvm-install.sh
    else
      echo "No local nvm installer found at scripts/nvm-install.sh" >&2
      echo "Please install nvm manually and re-run this script." >&2
      exit 1
    fi
  fi
  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "$HOME/.nvm" || printf %s "$XDG_CONFIG_HOME/nvm")"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  # shellcheck source=/dev/null
  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "$HOME/.nvm" || printf %s "$XDG_CONFIG_HOME/nvm")"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Ensure Node.js 22 is installed and active
nvm install 22
nvm use 22

# Install JS dependencies
npm ci

# Install Python dependencies
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
fi

