@echo off
if not defined in_subprocess (cmd /k set in_subprocess=y ^& %0 %*) & exit )
echo Setting up djs-purge-bot...
echo.
echo Installing NPM Packages...
echo.
npm ci
echo.
echo Setup Complete!