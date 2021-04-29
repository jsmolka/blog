@echo off

set dir=public

rem setup
rmdir %dir% /s /q
mkdir %dir%
pushd %dir%

rem clone
git clone -b deploy https://github.com/jsmolka/jsmolka.github.io .
git rm -r *

rem build
hugo -s .. -d %dir%
cmd /c npm run transform

rem commit and overwrite
git checkout --orphan newDeploy
git add -A
git commit -m "update site"
git branch -D deploy
git branch -m deploy
git gc --aggressive --prune=all
git push -f origin deploy

rem cleanup
popd
rmdir %dir% /s /q
