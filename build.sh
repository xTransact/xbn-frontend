# !/bin/bash
echo $CF_PAGES_BRANCH

if [ "$CF_PAGES_BRANCH" == "production" ]; then  # Run the "production" script in `package.json` on the "production" branch  # "production" should be replaced with the name of your Production branch
  echo 'production'
  # yarn build:production

else  # Else run the dev script  npm run devfi
  echo 'else'
  # yarn build:staging

fi