#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
学生时代模组兼容分析工具 - HTTP服务器启动脚本

功能：
1. 启动HTTP服务器，默认端口8000
2. 端口占用时自动向后寻找可用端口
3. 自动打开浏览器访问
4. 支持命令行参数指定端口
"""

import os
import sys
import socket
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


def is_port_available(port):
    """检查端口是否可用"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        return s.connect_ex(('localhost', port)) != 0


def find_available_port(start_port=8000):
    """寻找可用端口，从start_port开始向后寻找"""
    port = start_port
    while port < start_port + 100:  # 最多尝试100个端口
        if is_port_available(port):
            return port
        port += 1
    raise Exception(f"从{start_port}开始连续100个端口都已被占用")


def start_server(port=None):
    """启动HTTP服务器"""
    # 确定端口
    if port is None:
        port = find_available_port(8000)
    elif not is_port_available(port):
        print(f"端口 {port} 已被占用，正在寻找可用端口...")
        port = find_available_port(port)

    # 获取当前工作目录
    current_dir = Path(__file__).parent.absolute()
    os.chdir(current_dir)

    # 打印启动信息
    print("=" * 50)
    print("学生时代模组兼容分析工具")
    print("=" * 50)
    print(f"当前目录: {current_dir}")
    print(f"HTTP服务器启动中...")
    print(f"访问地址: http://localhost:{port}")
    print("按 Ctrl+C 停止服务器")
    print("=" * 50)

    # 自动打开浏览器
    try:
        webbrowser.open(f"http://localhost:{port}")
        print("浏览器已自动打开")
    except Exception as e:
        print(f"无法自动打开浏览器: {e}")

    # 创建并启动服务器
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器正在关闭...")
        httpd.shutdown()
        print("服务器已关闭")


if __name__ == "__main__":
    # 处理命令行参数
    port = None
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"无效的端口号: {sys.argv[1]}")
            print("使用默认端口8000")
    
    start_server(port)
