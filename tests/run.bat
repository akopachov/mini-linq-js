@echo off
IF not exist node_modules ( call npm install )
mocha test-core.js
pause