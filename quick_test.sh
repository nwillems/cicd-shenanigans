#!/bin/bash

echo "Faster faster"
git fetch origin
git checkout master
# Rebase or merge? No changes should exist on master
git rebase origin/master 

sleep 5

TEMP_BRANCH="quickie-`uuidgen`"
git checkout -b ${TEMP_BRANCH} origin/master

# Make updates to the thing we are quickly testing
echo "AA" >> quick.txt
git commit --author "ci-server@nwillems.dk" -m"Quickly tested" quick.txt

# Ensure status
git push origin ${TEMP_BRANCH}
commit_status='{"state": "success", "description": "Built from quick-test job", "context": "build & test"}'
commit_hash=`git rev-parse --verify HEAD`
curl -s https://api.github.com/repos/nwillems/cicd-shenanigans/statuses/${commit_hash} \
    -u $GITHUB_CREDENTIALS \
    -X POST \
    -d "$commit_status"

git fetch origin
git checkout testing && git rebase origin/testing
git checkout master && git rebase origin/master

git checkout ${TEMP_BRANCH}
git rebase origin/master

# Merge into testing and master
git checkout master
git merge --no-edit --no-ff -m"Merging quick-test update" ${TEMP_BRANCH}
git checkout testing
git merge --no-edit --no-ff -m"Merging quick-test update" ${TEMP_BRANCH}

git push origin master testing

