#!/bin/bash -x

git fetch origin

# -----------------------------------------------------------------------------
# Merge to sand
# -----------------------------------------------------------------------------

git checkout sandbox
git merge --ff-only origin/master

git push origin HEAD:sandbox

# -----------------------------------------------------------------------------
# Merge to prod
# -----------------------------------------------------------------------------

git checkout production
git merge --ff-only origin/master

git push origin HEAD:production

