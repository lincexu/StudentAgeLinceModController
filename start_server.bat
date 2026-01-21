@echo off

REM Student Age Mod Compatibility Analysis Tool
REM https://github.com/lincexu/StudentAgeLinceModController

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python not found. Please install Python 3.6+ first.
    pause
    exit /b 1
)

REM Start Python server with ANSI color support enabled for Windows 10+
set PYTHONIOENCODING=utf-8
python start_server.py

pause
