#!/bin/bash

git checkout master &&
npm publish &&
cd lib/hint &&
npm publish &&
git checkout develop
