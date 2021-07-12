@echo off
if not defined in_subprocess (cmd /k set in_subprocess=y ^& %0 %*) & exit )
echo Starting djs-purge-bot...
echo.
node index.js
cmd /k