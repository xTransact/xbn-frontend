# !/bin/bash
a=$CF_PAGES_BRANCH
b="master"
if [ $a == $b ]
then
   npm run build:production
else
   npm run build:staging
fi