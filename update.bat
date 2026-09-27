@echo off
echo ==============================================
echo  Updating TouchPower GitHub Repository...
echo ==============================================
git add .
git commit -m "Auto update: %DATE% %TIME%"
git push origin main
echo ==============================================
echo  All files updated on GitHub successfully!
echo ==============================================
pause
