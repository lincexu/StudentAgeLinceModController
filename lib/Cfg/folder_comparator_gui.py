import os
import shutil
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import threading

class SimpleFolderComparator:
    def __init__(self, root):
        self.root = root
        self.root.title("简单文件夹比较工具")
        self.root.geometry("700x600")
        
        # 创建界面
        self.create_widgets()
        
        # 存储匹配的文件
        self.matched_files = []
    
    def create_widgets(self):
        """创建界面组件"""
        # 标题
        tk.Label(
            self.root, 
            text="文件夹文件比较工具", 
            font=("Arial", 16, "bold"),
            fg="blue"
        ).pack(pady=10)
        
        # 文件夹A
        tk.Label(self.root, text="文件夹 A:", font=("Arial", 11)).pack(anchor=tk.W, padx=20)
        self.entry_a = tk.Entry(self.root, width=60)
        self.entry_a.pack(padx=20, pady=(0, 10))
        tk.Button(
            self.root, 
            text="选择文件夹A", 
            command=lambda: self.select_folder(self.entry_a)
        ).pack(pady=(0, 20))
        
        # 文件夹B
        tk.Label(self.root, text="文件夹 B:", font=("Arial", 11)).pack(anchor=tk.W, padx=20)
        self.entry_b = tk.Entry(self.root, width=60)
        self.entry_b.pack(padx=20, pady=(0, 10))
        tk.Button(
            self.root, 
            text="选择文件夹B", 
            command=lambda: self.select_folder(self.entry_b)
        ).pack(pady=(0, 20))
        
        # 输出文件夹C
        tk.Label(self.root, text="输出文件夹 C:", font=("Arial", 11)).pack(anchor=tk.W, padx=20)
        self.entry_c = tk.Entry(self.root, width=60)
        self.entry_c.insert(0, "./output")
        self.entry_c.pack(padx=20, pady=(0, 10))
        tk.Button(
            self.root, 
            text="选择输出文件夹", 
            command=lambda: self.select_folder(self.entry_c, is_output=True)
        ).pack(pady=(0, 20))
        
        # 按钮框架
        button_frame = tk.Frame(self.root)
        button_frame.pack(pady=10)
        
        self.compare_btn = tk.Button(
            button_frame,
            text="比较文件夹",
            command=self.compare_folders,
            bg="lightblue",
            font=("Arial", 10, "bold"),
            width=15
        )
        self.compare_btn.pack(side=tk.LEFT, padx=5)
        
        self.copy_btn = tk.Button(
            button_frame,
            text="复制文件",
            command=self.copy_files,
            bg="lightgreen",
            font=("Arial", 10, "bold"),
            width=15,
            state=tk.DISABLED
        )
        self.copy_btn.pack(side=tk.LEFT, padx=5)
        
        # 日志区域
        tk.Label(self.root, text="操作日志:", font=("Arial", 11)).pack(anchor=tk.W, padx=20, pady=(10, 0))
        self.log_text = scrolledtext.ScrolledText(
            self.root,
            width=80,
            height=15,
            font=("Consolas", 9)
        )
        self.log_text.pack(padx=20, pady=(0, 10))
        
        # 状态标签
        self.status_label = tk.Label(
            self.root,
            text="就绪",
            bd=1,
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def select_folder(self, entry_widget, is_output=False):
        """选择文件夹"""
        if is_output:
            folder = filedialog.askdirectory(title="选择输出文件夹")
        else:
            folder = filedialog.askdirectory(title="选择文件夹")
        
        if folder:
            entry_widget.delete(0, tk.END)
            entry_widget.insert(0, folder)
    
    def log_message(self, message):
        """添加日志消息"""
        self.log_text.insert(tk.END, message)
        self.log_text.see(tk.END)
        self.log_text.update()
    
    def update_status(self, message):
        """更新状态"""
        self.status_label.config(text=message)
        self.root.update_idletasks()
    
    def compare_folders(self):
        """比较文件夹"""
        folder_a = self.entry_a.get()
        folder_b = self.entry_b.get()
        
        if not folder_a or not os.path.exists(folder_a):
            messagebox.showerror("错误", "请选择有效的文件夹A")
            return
        
        if not folder_b or not os.path.exists(folder_b):
            messagebox.showerror("错误", "请选择有效的文件夹B")
            return
        
        # 禁用按钮
        self.compare_btn.config(state=tk.DISABLED)
        self.copy_btn.config(state=tk.DISABLED)
        
        # 清空日志
        self.log_text.delete(1.0, tk.END)
        
        # 在后台线程中执行比较
        thread = threading.Thread(target=self._compare_thread, args=(folder_a, folder_b))
        thread.daemon = True
        thread.start()
    
    def _compare_thread(self, folder_a, folder_b):
        """比较线程"""
        try:
            self.update_status("正在比较文件夹...")
            self.log_message(f"文件夹A: {folder_a}\n")
            self.log_message(f"文件夹B: {folder_b}\n\n")
            
            # 获取文件列表
            files_a = {}
            files_b = {}
            
            for file in os.listdir(folder_a):
                file_path = os.path.join(folder_a, file)
                if os.path.isfile(file_path):
                    filename, ext = os.path.splitext(file)
                    files_a[file] = ext.lower()
            
            for file in os.listdir(folder_b):
                file_path = os.path.join(folder_b, file)
                if os.path.isfile(file_path):
                    filename, ext = os.path.splitext(file)
                    files_b[file] = {
                        'path': file_path,
                        'ext': ext.lower()
                    }
            
            # 找出匹配的文件
            self.matched_files = []
            for file_a_name, file_a_ext in files_a.items():
                if file_a_name in files_b:
                    file_b_info = files_b[file_a_name]
                    if file_a_ext == file_b_info['ext']:
                        self.matched_files.append((file_a_name, file_b_info['path']))
            
            # 显示结果
            self.log_message(f"文件夹A中有 {len(files_a)} 个文件\n")
            self.log_message(f"文件夹B中有 {len(files_b)} 个文件\n")
            self.log_message(f"找到 {len(self.matched_files)} 个匹配的文件\n\n")
            
            if self.matched_files:
                self.log_message("匹配的文件列表:\n")
                for i, (filename, path) in enumerate(self.matched_files, 1):
                    size = os.path.getsize(path)
                    size_kb = size / 1024
                    self.log_message(f"{i:3}. {filename} ({size_kb:.1f} KB)\n")
            
            self.log_message("\n" + "="*50 + "\n")
            
            # 启用复制按钮
            self.root.after(0, lambda: self.copy_btn.config(state=tk.NORMAL))
            self.update_status(f"比较完成，找到 {len(self.matched_files)} 个匹配文件")
            
        except Exception as e:
            self.log_message(f"错误: {str(e)}\n")
            self.update_status("比较失败")
        finally:
            self.root.after(0, lambda: self.compare_btn.config(state=tk.NORMAL))
    
    def copy_files(self):
        """复制文件"""
        if not self.matched_files:
            messagebox.showwarning("警告", "没有找到匹配的文件")
            return
        
        folder_c = self.entry_c.get()
        if not folder_c:
            messagebox.showerror("错误", "请指定输出文件夹")
            return
        
        # 禁用按钮
        self.compare_btn.config(state=tk.DISABLED)
        self.copy_btn.config(state=tk.DISABLED)
        
        # 在后台线程中执行复制
        thread = threading.Thread(target=self._copy_thread, args=(folder_c,))
        thread.daemon = True
        thread.start()
    
    def _copy_thread(self, folder_c):
        """复制线程"""
        try:
            self.update_status("正在复制文件...")
            self.log_message(f"\n开始复制文件到: {folder_c}\n")
            
            # 创建输出文件夹
            os.makedirs(folder_c, exist_ok=True)
            
            copied = 0
            for filename, src_path in self.matched_files:
                dst_path = os.path.join(folder_c, filename)
                
                # 处理重复文件
                counter = 1
                base_name, ext = os.path.splitext(filename)
                while os.path.exists(dst_path):
                    new_filename = f"{base_name}_{counter}{ext}"
                    dst_path = os.path.join(folder_c, new_filename)
                    counter += 1
                
                try:
                    shutil.copy2(src_path, dst_path)
                    copied += 1
                    if dst_path != os.path.join(folder_c, filename):
                        self.log_message(f"✓ {filename} -> {os.path.basename(dst_path)}\n")
                    else:
                        self.log_message(f"✓ {filename}\n")
                except Exception as e:
                    self.log_message(f"✗ {filename} (错误: {str(e)})\n")
            
            self.log_message(f"\n复制完成! 成功复制 {copied} 个文件\n")
            self.update_status(f"复制完成，成功复制 {copied} 个文件")
            
            # 显示完成对话框
            self.root.after(0, lambda: messagebox.showinfo(
                "完成", 
                f"成功复制 {copied} 个文件到:\n{folder_c}"
            ))
            
        except Exception as e:
            self.log_message(f"错误: {str(e)}\n")
            self.update_status("复制失败")
        finally:
            self.root.after(0, lambda: self.compare_btn.config(state=tk.NORMAL))
            self.root.after(0, lambda: self.copy_btn.config(state=tk.NORMAL))

if __name__ == "__main__":
    root = tk.Tk()
    app = SimpleFolderComparator(root)
    root.mainloop()