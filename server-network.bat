@echo off

for /f "tokens=1-2 delims=:" %%a in ('ipconfig^|find "IPv4"') do set ip=%%b
set ip=%ip:~1%
hugo server -D --disableFastRender --verbose --bind=%ip% --baseURL=http://%ip%
