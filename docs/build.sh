#!/bin/bash

# BOB_VERSION environment variable is required
if [ -z "$BOB_VERSION" ]; then
  echo 'Please set the required environment variable for bob version to install'
  echo 'E.g. BOB_VERSION=2.0.0'
  exit 1
fi

# Install Deno if not already installed
if ! deno --version; then
  curl -fsSL https://deno.land/x/install/install.sh | sh
# Add default deno bin folder to PATH
  PATH="$HOME/.deno/bin:$PATH"
fi

# Build site
deno run -A "https://deno.land/x/bob@v$BOB_VERSION/cli.ts" $BOB_OPTIONS
