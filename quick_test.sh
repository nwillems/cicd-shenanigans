#!/bin/bash

env

git config user.email "ciserver@nwillems.dk"
git config user.name "CI Server"

echo "Faster faster. Ensuring base branch is up to date..."
git fetch origin
git checkout master
# Rebase or merge? No changes should exist on master
git rebase origin/master 

sleep 35

echo "Creating temporary branch for changes"
TEMP_BRANCH="quickie-`uuidgen`"
git checkout -b ${TEMP_BRANCH} origin/master

echo "Make updates to the thing we are quickly testing"
echo "AA" >> quick.txt
git commit --author "CI <ci-server@nwillems.dk>" -m"Quickly tested" quick.txt

# Ensure status
echo "Ensuring commit is available and status is set"
git push origin ${TEMP_BRANCH}
commit_status='{"state": "success", "description": "Built from quick-test job", "context": "build & test"}'
commit_hash=`git rev-parse --verify HEAD`
curl -s https://api.github.com/repos/nwillems/cicd-shenanigans/statuses/${commit_hash} \
    -u "${GITHUB_CREDENTIALS}:" \
    -X POST \
    -d "$commit_status"

echo "Updating base branches"
git fetch origin
git checkout testing && git rebase origin/testing
git checkout master && git rebase origin/master

echo "Ensuring temp branch is up to date"
git checkout ${TEMP_BRANCH}
git rebase origin/master

echo "Merge into testing and master"
git checkout master
git merge --no-edit --no-ff -m"Merging quick-test update" ${TEMP_BRANCH}
git checkout testing
git merge --no-edit --no-ff -m"Merging quick-test update" ${TEMP_BRANCH}

echo "Publishing changes for master and testing"
git push origin master testing

