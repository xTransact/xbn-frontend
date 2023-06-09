# !/bin/bash
test="$CF_PAGES_BRANCH" == "master"
echo $test
if [ "$CF_PAGES_BRANCH" == "master" ]; then
  # Run the "production" script in `package.json` on the "production" branch
  # "production" should be replaced with the name of your Production branch

  npm run build:production
  return

else
  # Else run the dev script
  npm run build:staging

fi