@echo off
title Instagram Influencer Tracker SaaS
color 0A
echo =================================================================
echo   📸 INSTAGRAM INFLUENCER TRACKER - DESKTOP SAAS APPLICATION
echo =================================================================
echo.
echo Starting Python Backend & React Frontend...
echo.

python start_app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Application exited with error code %ERRORLEVEL%.
    pause
)
