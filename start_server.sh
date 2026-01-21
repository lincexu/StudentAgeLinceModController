#!/bin/bash

# 设置UTF-8编码
export LANG="zh_CN.UTF-8"
export LC_ALL="zh_CN.UTF-8"

echo "正在启动学生时代模组兼容分析工具..."
echo

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未安装Python 3或Python 3未添加到系统PATH"
    echo "请先安装Python 3.6或更高版本"
    echo
    read -p "按回车键退出..." -n 1 -r
    exit 1
fi

# 确保脚本有执行权限
chmod +x start_server.py

# 启动Python服务器
python3 start_server.py
