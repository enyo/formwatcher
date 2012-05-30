#!/bin/bash

cd lib
for i in *.js; do
  echo $i
  uglifyjs --max-line-len 200 "$i" > "../minified/$i";
done;
for i in */*.js; do
  echo $i
  uglifyjs --max-line-len 200 "$i" > "../minified/$i";
done;
cd ..


packFile="minified/formwatcher.pack.js"
cat "minified/formwatcher.js" > "$packFile"
cat "minified/validators.js" >> "$packFile"
cat "minified/hint/hint.js" >> "$packFile"