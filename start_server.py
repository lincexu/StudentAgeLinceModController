#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Student Age Mod Compatibility Analysis Tool - HTTP Server Startup Script

Features:
1. Start HTTP server with default port 8000
2. Automatically find available port if 8000 is occupied
3. Automatically open browser for access
4. Support command line port specification
"""

import os
import sys
import socket
import webbrowser
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


def parse_jsonc(file_path):
    """Parse JSONC file (JSON with comments)"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove single-line comments
    content = '\n'.join([line.split('//')[0].rstrip() for line in content.split('\n')])
    
    # Remove multi-line comments (simplified, assumes no nested comments)
    content = content.replace('/*', '').replace('*/', '')
    
    return json.loads(content)


def write_jsonc(file_path, data):
    """Write data to JSONC file"""
    # Read original file to preserve comments
    original_content = ''
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
    except Exception:
        pass
    
    # Write updated JSON data
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Custom HTTP request handler that supports POST requests for updating config"""
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/update-config':
            # Get content length
            content_length = int(self.headers['Content-Length'])
            # Read request body
            post_data = self.rfile.read(content_length)
            # Parse JSON data
            try:
                config_data = json.loads(post_data)
                # Write to config.jsonc
                write_jsonc('config.jsonc', config_data)
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
            except Exception as e:
                # Send error response
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
        else:
            # Default POST handling
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': 'Not found'}).encode('utf-8'))


# ANSI color codes
class Colors:
    RESET = '\033[0m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    WHITE = '\033[97m'
    GREEN = '\033[92m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'


def is_port_available(port):
    """Check if port is available"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        return s.connect_ex(('localhost', port)) != 0


def find_available_port(start_port=8000):
    """Find available port starting from start_port"""
    port = start_port
    while port < start_port + 100:  # Try up to 100 ports
        if is_port_available(port):
            return port
        port += 1
    raise Exception(f"No available ports found in 100 attempts starting from {start_port}")


def start_server(port=None):
    """Start HTTP server"""
    # Determine port
    if port is None:
        port = find_available_port(8000)
    elif not is_port_available(port):
        print(f"Port {port} is occupied, finding available port...")
        port = find_available_port(port)

    # Get current working directory
    current_dir = Path(__file__).parent.absolute()
    os.chdir(current_dir)

    # Read version and autoOpenBrowser from config.jsonc
    version = "0.1.0"  # Default version
    auto_open_browser = True  # Default value
    try:
        config = parse_jsonc("config.jsonc")
        version = config.get("version", "0.1.0")
        auto_open_browser = config.get("autoOpenBrowser", True)
    except Exception:
        pass  # Use default values if config file is not available

    # Print ASCII art
    print(f"{Colors.BOLD}{Colors.BLUE}   _|_|_|    _|_|    _|        _|      _|    _|_|_|  {Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE} _|        _|    _|  _|        _|_|  _|_|  _|        {Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}   _|_|    _|_|_|_|  _|        _|  _|  _|  _|        {Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}       _|  _|    _|  _|        _|      _|  _|        {Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE} _|_|_|    _|    _|  _|_|_|_|  _|      _|    _|_|_|  {Colors.RESET}")
    
    # Print styled welcome messages
    border = f"{Colors.CYAN}┌{"─" * 52}┐{Colors.RESET}"
    border_mid = f"{Colors.CYAN}├{"─" * 52}┤{Colors.RESET}"
    border_bottom = f"{Colors.CYAN}└{"─" * 52}┘{Colors.RESET}"
    
    print(border)
    print(f"{Colors.CYAN}│{Colors.RESET} {Colors.BOLD}{Colors.GREEN}欢迎使用学生时代模组兼容分析工具{Colors.RESET} {Colors.CYAN}│{Colors.RESET}")
    print(border_mid)
    print(f"{Colors.CYAN}│{Colors.RESET} Powered by {Colors.BOLD}{Colors.BLUE}Lince{Colors.RESET} {' ' * (42 - len(f'Powered by Lince'))} {Colors.CYAN}│{Colors.RESET}")
    print(f"{Colors.CYAN}│{Colors.RESET} StudentAge LinceModController v{Colors.BOLD}{version}{Colors.RESET} {' ' * (42 - len(f'SALMC v{version}'))} {Colors.CYAN}│{Colors.RESET}")
    print(border_mid)
    print(f"{Colors.CYAN}│{Colors.RESET} {Colors.BOLD}{Colors.YELLOW}关闭此页面将导致HTTP服务中断{Colors.RESET} {Colors.CYAN}│{Colors.RESET}")
    print(border_bottom)
    print()
    print(f"{Colors.CYAN}●{Colors.RESET} {Colors.BOLD}当前服务运行在{Colors.RESET}")
    print(f"{Colors.CYAN}  {Colors.RESET} {Colors.GREEN}http://localhost:{port}{Colors.RESET}")
    print(f"{Colors.CYAN}●{Colors.RESET} {Colors.BOLD}您也可以通过{Colors.RESET} {Colors.YELLOW}Ctrl+C{Colors.RESET} {Colors.BOLD}安全地结束服务{Colors.RESET}")
    print()

    # Auto open browser if configured
    if auto_open_browser:
        try:
            webbrowser.open(f"http://localhost:{port}")
        except Exception:
            pass  # Silently ignore browser opening errors

    # Create and start server
    server_address = ('', port)
    httpd = HTTPServer(server_address, CustomHTTPRequestHandler)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        httpd.shutdown()


if __name__ == "__main__":
    # Handle command line arguments
    port = None
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port number: {sys.argv[1]}")
            print("Using default port 8000")
    
    start_server(port)
