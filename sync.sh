#!/bin/sh
git co iot tmpl/elements/**;
find tmpl/elements -name 'designer.ts' | xargs rm