#!/bin/bash

docco src/*.coffee

cd lib
for i in *.js; do
  echo $i
  uglifyjs --max-line-len 200 "$i" > ../minified/$i;
done;
cd ..

cat "minified/formwatcher.js" > "minified/formwatcher.pack.js"
cat "minified/formwatcher.validators.js" >> "minified/formwatcher.pack.js"
cat "minified/formwatcher.Hint.js" >> "minified/formwatcher.pack.js"