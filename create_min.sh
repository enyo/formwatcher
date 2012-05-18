#!/bin/bash

for i in lib/*.js; do
  uglifyjs --max-line-len 200 "$i" > minified/$i;
done;

cat "minified/formwatcher.js" > "minified/formwatcher.pack.js"
cat "minified/formwatcher.validators.js" >> "minified/formwatcher.pack.js"
cat "minified/formwatcher.Hint.js" >> "minified/formwatcher.pack.js"