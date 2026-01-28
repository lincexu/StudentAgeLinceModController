#!/usr/bin/env python3
"""
TalkCfg JSON File Simplifier
Extracts only id and content properties from JSON files matching TalkCfg pattern
Renames 'content' property to 'name' in output
"""

import json
import os
import re
import sys
import glob
import argparse

def find_talkcfg_files(directory="."):
    """
    Find JSON files containing TalkCfg in filename
    
    Args:
        directory (str): Search directory, default is current directory
        
    Returns:
        list: Found file paths
    """
    patterns = [
        "**/*TalkCfg*.json",     # Files containing TalkCfg
        "**/TalkCfg*.json",      # Files starting with TalkCfg
        "**/*#*.json",           # Files containing # (likely with numbers)
        "*.json"                 # All JSON files (filtered later)
    ]
    
    found_files = []
    
    for pattern in patterns:
        files = glob.glob(os.path.join(directory, pattern), recursive=True)
        
        for file_path in files:
            filename = os.path.basename(file_path).lower()
            if "talkcfg" in filename or "#" in filename:
                if file_path not in found_files:
                    found_files.append(file_path)
    
    if not found_files:
        all_json = glob.glob("*.json")
        for json_file in all_json:
            if re.search(r'#[0-9]+', json_file) or re.search(r'talk', json_file, re.IGNORECASE):
                found_files.append(json_file)
    
    return found_files

def detect_file_encoding(file_path, default='utf-8'):
    """
    Detect file encoding
    
    Args:
        file_path: File path
        default: Default encoding
        
    Returns:
        Detected encoding
    """
    encodings_to_try = ['utf-8', 'utf-8-sig', 'gb18030', 'gbk', 'big5', 'latin-1']
    
    for encoding in encodings_to_try:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                f.read(1024)
            return encoding
        except UnicodeDecodeError:
            continue
    
    return default

def extract_id_content_from_file(input_file):
    """
    Extract id and content properties from a single JSON file
    Renames 'content' to 'name' in output
    
    Args:
        input_file (str): Input JSON file path
        
    Returns:
        dict: Extracted data with id and name, None if failed
    """
    try:
        file_encoding = detect_file_encoding(input_file)
        
        with open(input_file, 'r', encoding=file_encoding) as f:
            content = f.read()
        
        data = json.loads(content)
        
        new_data = {}
        for key, value in data.items():
            if isinstance(value, dict):
                new_data[key] = {
                    "id": value.get("id"),
                    "name": value.get("content")  # Rename content to name
                }
        
        return new_data
    
    except json.JSONDecodeError as e:
        print(f"Error: {input_file} is not a valid JSON file - {str(e)}")
        return None
    except Exception as e:
        print(f"Error processing {input_file}: {str(e)}")
        return None

def create_output_filename(input_file, suffix="_simplified"):
    """
    Create output filename based on input filename
    
    Args:
        input_file (str): Input file path
        suffix (str): Filename suffix
        
    Returns:
        str: Output filename
    """
    dir_path, filename = os.path.split(input_file)
    name, ext = os.path.splitext(filename)
    
    if "#" in name:
        new_name = f"{name}{suffix}{ext}"
    else:
        new_name = f"{name}{suffix}{ext}"
    
    output_dir = os.path.join(dir_path, "simplified_output")
    os.makedirs(output_dir, exist_ok=True)
    
    return os.path.join(output_dir, new_name)

def process_talkcfg_files(directory=".", single_file=None):
    """
    Process TalkCfg files
    
    Args:
        directory (str): Search directory, default is current directory
        single_file (str): Optional, process single specified file
    """
    print("=" * 60)
    print("TalkCfg JSON File Simplifier")
    print("Note: 'content' will be renamed to 'name' in output")
    print("=" * 60)
    
    if single_file:
        files_to_process = [single_file]
        if not os.path.exists(single_file):
            print(f"Error: File {single_file} does not exist")
            return
    else:
        print(f"Searching for TalkCfg files in directory '{directory}'...")
        files_to_process = find_talkcfg_files(directory)
    
    if not files_to_process:
        print("No TalkCfg files found matching criteria")
        print("Hint: Files should contain 'TalkCfg' or '#' in filename")
        return
    
    print(f"Found {len(files_to_process)} file(s):")
    for i, file_path in enumerate(files_to_process, 1):
        filename = os.path.basename(file_path)
        print(f"  {i}. {filename}")
    
    print(f"\nStarting processing...")
    print("-" * 50)
    
    success_count = 0
    for input_file in files_to_process:
        filename = os.path.basename(input_file)
        print(f"Processing: {filename}")
        
        extracted_data = extract_id_content_from_file(input_file)
        
        if extracted_data:
            output_file = create_output_filename(input_file)
            
            try:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(extracted_data, f, ensure_ascii=False, indent=4)
                
                output_filename = os.path.basename(output_file)
                print(f"  Successfully saved to: {output_filename}")
                print(f"  Extracted {len(extracted_data)} objects")
                success_count += 1
                
            except Exception as e:
                print(f"  Save failed: {str(e)}")
        else:
            print(f"  Extraction failed")
        
        print("")
    
    print("-" * 50)
    print(f"Processing complete! Successfully processed {success_count}/{len(files_to_process)} file(s)")
    
    if files_to_process:
        sample_file = files_to_process[0]
        output_dir = os.path.join(os.path.dirname(sample_file), "simplified_output")
        print(f"Output files saved in: {output_dir}")
        print("\nNote: In the output files, 'content' has been renamed to 'name'")

def main():
    """
    Main function with command line arguments support
    """
    parser = argparse.ArgumentParser(
        description='Extract id and content properties from TalkCfg JSON files (renames content to name)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python talkcfg_simplifier.py                    # Process all TalkCfg files in current directory
  python talkcfg_simplifier.py -d /path/to/files  # Process files in specified directory
  python talkcfg_simplifier.py -f myfile.json     # Process single file
  
Note: Output JSON will contain 'id' and 'name' (renamed from 'content')
        """
    )
    
    parser.add_argument('-d', '--directory', default='.', 
                       help='Search directory (default: current directory)')
    parser.add_argument('-f', '--file', 
                       help='Process single file')
    parser.add_argument('-v', '--version', action='version', 
                       version='TalkCfg JSON Simplifier v1.1')
    
    args = parser.parse_args()
    
    if args.file:
        process_talkcfg_files(single_file=args.file)
    else:
        process_talkcfg_files(directory=args.directory)

def interactive_mode():
    """
    Interactive mode for user-friendly operation
    """
    print("=" * 60)
    print("TalkCfg JSON File Simplifier")
    print("Note: 'content' will be renamed to 'name' in output")
    print("=" * 60)
    print()
    
    print("Select operation mode:")
    print("1. Process all TalkCfg files in current directory")
    print("2. Specify directory to process")
    print("3. Process single file")
    print("4. Exit")
    print()
    
    choice = input("Enter choice (1-4): ").strip()
    
    if choice == '1':
        process_talkcfg_files()
    elif choice == '2':
        directory = input("Enter directory path: ").strip()
        if os.path.isdir(directory):
            process_talkcfg_files(directory=directory)
        else:
            print(f"Error: Directory '{directory}' does not exist")
    elif choice == '3':
        file_path = input("Enter file path: ").strip()
        if os.path.exists(file_path):
            process_talkcfg_files(single_file=file_path)
        else:
            print(f"Error: File '{file_path}' does not exist")
    elif choice == '4':
        print("Exiting program")
    else:
        print("Invalid choice, defaulting to current directory")
        process_talkcfg_files()

if __name__ == "__main__":
    # If no command line arguments, use interactive mode
    if len(sys.argv) == 1:
        interactive_mode()
    else:
        main()
    
    # Wait for user confirmation to prevent immediate window closure (Windows)
    if sys.platform.startswith('win'):
        print("")
        try:
            input("Press Enter to exit...")
        except:
            pass