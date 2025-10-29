@echo off
echo StegaPass USB Setup
echo.
echo This script will copy StegaPass files to your USB drive
echo.
echo DISCONNECT all USB drives except the one you want to set up
echo.
pause

echo.
echo Please enter the drive letter of your USB (e.g., E, F, G, etc.)
set /p drive=Enter drive letter (without colon): 

if not exist %drive%:\ (
    echo.
    echo ERROR: Drive %drive%: does not exist or is not accessible
    echo Please check the drive letter and try again
    pause
    exit /b 1
)

echo.
echo Copying files to %drive%:\...
copy ".stps_marker" "%drive%:\" >nul 2>&1
copy "README.txt" "%drive%:\" >nul 2>&1

if exist "carrier.png" (
    copy "carrier.png" "%drive%:\" >nul 2>&1
    echo ✓ carrier.png copied
) else (
    echo ⚠ carrier.png not found (you can create one manually)
)

echo ✓ .stps_marker copied
echo ✓ README.txt copied
echo.
echo Setup complete! Your USB is now ready for StegaPass
echo.
echo You can unplug and replug your USB to test detection
pause

