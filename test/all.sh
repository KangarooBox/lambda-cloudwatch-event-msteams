#!/usr/bin/env bash
set -e

for file in test/*.json; do
  if [[ $file == "test/context.json" || $file == "test/event.json" ]] ; then
    continue;
  fi
  node-lambda run -x test/context.json -j $file
done
