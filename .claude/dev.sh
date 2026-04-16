#!/bin/bash
# Wrapper that activates nvm then runs `npm run dev` so the preview harness
# can find node even though its PATH is minimal.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 24 >/dev/null 2>&1
export PATH="$HOME/.nvm/versions/node/v24.11.0/bin:$PATH"
cd "$(dirname "$0")/.."
exec npm run dev -- --host
