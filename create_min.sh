#!/bin/bash

for i in *.js; do
  uglifyjs --max-line-len 300 "$i" > minified/$i;
done;