#!/bin/bash


echo "Going to checkout master and publish to npm..." &&
read &&
git checkout master &&
npm publish &&

for i in $(find lib/* -maxdepth 0 -type d ); do
  npm publish $i
done

git checkout develop
