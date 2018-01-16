#!/bin/bash

echo "Take your time. Updating to latest and updating test-staging area"
git fetch origin
git checkout stag
git merge --ff-only origin/testing
git push origin stag

# Run the tests - wow much speedup!!!
sleep 10

git fetch origin

echo "Ensuring master up to date"
git checkout master
git rebase origin/master

echo "Merging changes into master"
git merge --log -m "Merge slow-tested changes from testing" --no-ff \
    $(git rev-list --max-count=1 stag)

# Replace origin/testing below, with the currently tested hash
# git merge --no-ff origin/testing

echo "Publishing changes"
git push origin master

