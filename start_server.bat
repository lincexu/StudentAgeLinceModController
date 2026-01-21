@echo off
chcp 65001 >nul

echo 正在启动学生时代模组兼容分析工具...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未安装Python或Python未添加到系统PATH
    echo 请先安装Python 3.6或更高版本
    echo.
    pause
    exit /b 1
)

REM 启动Python服务器
python start_server.py

pause
