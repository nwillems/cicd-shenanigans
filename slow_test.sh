#!/bin/bash

echo "Take your time"

git fetch origin
git checkout stag
git merge --ff-only origin/testing

# Run the tests - wow much speedup!!!
sleep 10

git fetch origin

git checkout master
git rebase origin/master

git merge --log -m "Merge slow-tested changes from testing" --no-ff \
    $(git rev-list --max-count=1 stag)

# Replace origin/testing below, with the currently tested hash
# git merge --no-ff origin/testing
