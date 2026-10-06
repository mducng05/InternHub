import os
import re
import unicodedata
import markdown

md_path = r"c:\laragon\www\QLPM\BAO_CAO_DO_AN_QLPM.md"
html_path = r"c:\laragon\www\QLPM\BAO_CAO_DO_AN_QLPM.html"

with open(md_path, "r", encoding="utf-8") as f:
    raw_md = f.read()

# Replace page break tags
raw_md = raw_md.replace(r"\newpage", '<div class="page-break"></div>')

# Ensure blank lines before markdown tables so they are always parsed as <table>
raw_md = re.sub(r'([^\n])\n(\|[^\n]+\|)\n(\|[\s\-:|]+\|)', r'\1\n\n\2\n\3', raw_md)

# Custom regex to convert [Chèn hình ảnh: ...] into visual interactive upload/display boxes
def img_placeholder_repl(match):
    text = match.group(1).strip()
    return f'''
<div class="image-placeholder-box" onclick="this.querySelector('input[type=file]').click()">
    <div class="placeholder-icon">📷</div>
    <div class="placeholder-title">{text}</div>
    <div class="placeholder-hint">Bấm hoặc kéo thả ảnh vào đây để hiển thị trực tiếp</div>
    <input type="file" accept="image/*" style="display:none" onchange="previewImage(this, event)">
    <img class="preview-img" style="display:none" alt="{text}">
</div>
'''

raw_md = re.sub(r'\[Chèn hình ảnh:\s*(.*?)\]', img_placeholder_repl, raw_md)

# Extract cover page (before first page-break / MỤC LỤC) and content
cover_html = """
<div class="cover-page">
    <div class="cover-header">
        <h3>BỘ THÔNG TIN VÀ TRUYỀN THÔNG</h3>
        <h3>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</h3>
        <div class="cover-line"></div>
    </div>

    <div class="cover-logo-box">
        <div class="image-placeholder-box" style="max-width: 140px; margin: 15px auto; padding: 12px;" onclick="this.querySelector('input[type=file]').click()">
            <div class="placeholder-icon" style="font-size:24px">🏛️</div>
            <div class="placeholder-title" style="font-size:10pt">Logo PTIT</div>
            <input type="file" accept="image/*" style="display:none" onchange="previewImage(this, event)">
            <img class="preview-img" style="display:none; max-height: 100px;" alt="Logo PTIT">
        </div>
    </div>

    <div class="cover-title-section">
        <h1 class="main-report-title">BÁO CÁO ĐỒ ÁN MÔN HỌC</h1>
        <h2 class="sub-subject-title">MÔN HỌC: QUẢN LÝ DỰ ÁN PHẦN MỀM</h2>
        
        <div class="topic-box">
            <div class="topic-label">ĐỀ TÀI:</div>
            <h2 class="topic-name">XÂY DỰNG NỀN TẢNG KẾT NỐI VÀ GỢI Ý VIỆC LÀM THỰC TẬP CHO SINH VIÊN (INTERNHUB)</h2>
        </div>
    </div>

    <div class="cover-students-meta">
        <p><strong>Giảng viên hướng dẫn:</strong> TS. &lt;Điền tên Giảng viên hướng dẫn&gt;</p>
        <p><strong>Thực hiện bởi nhóm sinh viên, bao gồm:</strong></p>
        <table class="cover-students-table">
            <tr>
                <td>1. <strong>Nguyễn Minh Đức</strong></td>
                <td>MSSV: &lt;Điền MSSV&gt;</td>
                <td>Lớp: &lt;Điền Lớp&gt;</td>
                <td><strong>(Trưởng nhóm - Backend Lead)</strong></td>
            </tr>
            <tr>
                <td>2. <strong>Trần Hưng Thịnh</strong></td>
                <td>MSSV: &lt;Điền MSSV&gt;</td>
                <td>Lớp: &lt;Điền Lớp&gt;</td>
                <td><strong>(Thành viên - Frontend Lead)</strong></td>
            </tr>
            <tr>
                <td>3. <strong>Đức Minh</strong></td>
                <td>MSSV: &lt;Điền MSSV&gt;</td>
                <td>Lớp: &lt;Điền Lớp&gt;</td>
                <td><strong>(Thành viên - QA / Tester)</strong></td>
            </tr>
        </table>
    </div>

    <div class="cover-footer">
        <p><strong>TP. HỒ CHÍ MINH, THÁNG 10 / 2026</strong></p>
    </div>
</div>
<div class="page-break"></div>
"""

# Find where MỤC LỤC starts
muc_luc_pos = raw_md.find("# MỤC LỤC")
if muc_luc_pos != -1:
    body_md = raw_md[muc_luc_pos:]
else:
    body_md = raw_md

# Convert Markdown to HTML with extensions
md_extensions = [
    'extra',
    'toc',
    'nl2br',
    'sane_lists'
]

html_body = markdown.markdown(body_md, extensions=md_extensions)

full_html = f'''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo Đồ án QLPM - InternHub (PTIT)</title>
    <!-- MathJax for formula rendering -->
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        * {{
            box-sizing: border-box;
        }}

        html {{
            scroll-behavior: smooth;
        }}

        body {{
            font-family: "Times New Roman", Times, Georgia, serif;
            font-size: 13pt;
            line-height: 1.4;
            color: #111827;
            background-color: #f1f5f9;
            margin: 0;
            padding: 30px 0;
        }}

        /* Document Paper container */
        .paper-container {{
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: #ffffff;
            padding: 20mm 20mm 20mm 30mm;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
            border-radius: 4px;
        }}

        /* Typography & Headings */
        h1, h2, h3, h4 {{
            font-family: "Times New Roman", Times, serif;
            color: #000000;
            page-break-after: avoid;
        }}

        h1 {{
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-top: 24pt;
            margin-bottom: 14pt;
            line-height: 1.5;
        }}

        h2 {{
            font-size: 14.5pt;
            font-weight: bold;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 4px;
            margin-top: 20pt;
            margin-bottom: 10pt;
        }}

        h3 {{
            font-size: 13.5pt;
            font-weight: bold;
            margin-top: 14pt;
            margin-bottom: 8pt;
        }}

        h4 {{
            font-size: 13pt;
            font-weight: bold;
            font-style: italic;
            margin-top: 10pt;
            margin-bottom: 6pt;
        }}

        p {{
            text-align: justify;
            text-indent: 1.25cm;
            margin-top: 0;
            margin-bottom: 8pt;
            line-height: 1.4;
        }}

        /* Paragraphs without indent */
        .no-indent, .image-placeholder-box + p, table + p, h1 + p, h2 + p, h3 + p {{
            text-indent: 0;
        }}

        /* Lists */
        ul, ol {{
            margin-top: 4pt;
            margin-bottom: 8pt;
            padding-left: 2cm;
            text-align: justify;
        }}

        li {{
            margin-bottom: 4pt;
            line-height: 1.35;
        }}

        /* Tables */
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 14pt 0;
            font-size: 11pt;
            page-break-inside: avoid;
        }}

        table, th, td {{
            border: 1px solid #1f2937;
        }}

        th {{
            background-color: #f1f5f9;
            color: #111827;
            font-weight: bold;
            padding: 8px 6px;
            text-align: center;
            vertical-align: middle;
        }}

        td {{
            padding: 6px 8px;
            vertical-align: top;
            text-align: left;
            line-height: 1.3;
        }}

        td:first-child {{
            text-align: center;
            font-weight: 500;
        }}

        /* Images in document */
        .paper-container img {{
            max-width: 100%;
            height: auto;
            display: block;
            margin: 16px auto 8px auto;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }}

        /* Figure captions */
        p:has(img) + p, img + p {{
            text-align: center !important;
            text-indent: 0 !important;
            font-size: 11.5pt;
            font-style: italic;
            color: #374151;
            margin-top: 4px;
            margin-bottom: 16px;
        }}

        /* Cover Page Styling */
        .cover-page {{
            text-align: center;
            border: 4px double #1f2937;
            padding: 15mm 12mm;
            min-height: 250mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            margin-bottom: 20mm;
            background: #ffffff;
        }}

        .cover-header h3 {{
            margin: 0;
            font-size: 14pt;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.5px;
        }}

        .cover-line {{
            width: 180px;
            height: 1.5px;
            background: #111827;
            margin: 12px auto;
        }}

        .cover-title-section {{
            margin: 20px 0;
        }}

        .main-report-title {{
            font-size: 26pt !important;
            margin: 15px 0 5px 0 !important;
            letter-spacing: 1px;
            color: #0f172a;
            font-weight: bold;
        }}

        .sub-subject-title {{
            font-size: 16pt !important;
            border: none !important;
            margin: 5px 0 25px 0 !important;
            color: #334155;
            font-weight: bold;
        }}

        .topic-box {{
            margin: 20px 0;
            padding: 15px 20px;
            background: #f8fafc;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
        }}

        .topic-label {{
            font-size: 14pt;
            font-weight: bold;
            color: #475569;
            margin-bottom: 6px;
        }}

        .topic-name {{
            font-size: 17pt !important;
            border: none !important;
            margin: 0 !important;
            color: #1e3a8a;
            font-weight: bold;
            line-height: 1.4;
            text-transform: uppercase;
        }}

        .cover-students-meta {{
            text-align: left;
            margin: 20px 20px;
            font-size: 13pt;
            line-height: 1.6;
        }}

        .cover-students-meta p {{
            text-indent: 0;
            margin-bottom: 6px;
        }}

        .cover-students-table {{
            border: none !important;
            margin: 10px 0;
        }}

        .cover-students-table td {{
            border: none !important;
            padding: 4px 6px;
            font-size: 12pt;
        }}

        .cover-students-table td:first-child {{
            text-align: left;
        }}

        .cover-footer {{
            margin-top: 15px;
            font-weight: bold;
            font-size: 13pt;
            text-align: center;
        }}

        .cover-footer p {{
            text-indent: 0;
            text-align: center;
        }}

        /* Image Placeholder Box */
        .image-placeholder-box {{
            border: 2px dashed #4f46e5;
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 24px 16px;
            margin: 18px auto;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            max-width: 92%;
        }}

        .image-placeholder-box:hover {{
            background-color: #eef2ff;
            border-color: #3730a3;
            box-shadow: 0 4px 14px rgba(79, 70, 229, 0.15);
        }}

        .placeholder-icon {{
            font-size: 32px;
            margin-bottom: 6px;
        }}

        .placeholder-title {{
            font-weight: bold;
            color: #1e3a8a;
            font-size: 12.5pt;
            margin-bottom: 4px;
        }}

        .placeholder-hint {{
            font-size: 10pt;
            color: #64748b;
            font-style: italic;
        }}

        .preview-img {{
            max-width: 100%;
            height: auto;
            margin-top: 12px;
            border-radius: 6px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.12);
        }}

        /* Links */
        a {{
            color: #1d4ed8;
            text-decoration: none;
        }}

        a:hover {{
            text-decoration: underline;
        }}

        /* Floating Toolbar */
        .floating-toolbar {{
            position: fixed;
            bottom: 24px;
            right: 24px;
            display: flex;
            gap: 10px;
            z-index: 9999;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 14px;
            border-radius: 50px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
            backdrop-filter: blur(8px);
            border: 1px solid #e2e8f0;
        }}

        .btn-tool {{
            display: flex;
            align-items: center;
            gap: 6px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 9px 16px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            font-family: system-ui, -apple-system, sans-serif;
        }}

        .btn-tool:hover {{
            background: #1d4ed8;
            transform: translateY(-2px);
        }}

        .btn-tool.secondary {{
            background: #475569;
        }}

        .btn-tool.secondary:hover {{
            background: #334155;
        }}

        /* Print media rules */
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            .paper-container {{
                box-shadow: none;
                margin: 0;
                padding: 0;
                max-width: 100%;
            }}
            .floating-toolbar {{
                display: none !important;
            }}
            .page-break {{
                page-break-before: always;
            }}
            .cover-page {{
                min-height: 270mm;
            }}
            .image-placeholder-box {{
                border: 1px dashed #94a3b8;
                background: #f8fafc;
            }}
            .placeholder-hint {{
                display: none;
            }}
        }}
    </style>
</head>
<body>

    <div class="floating-toolbar">
        <button class="btn-tool" onclick="window.print()">🖨️ In / Lưu PDF</button>
        <button class="btn-tool secondary" onclick="copyDocumentToClipboard()">📋 Sao chép sang Word</button>
        <button class="btn-tool secondary" onclick="window.scrollTo({{top: 0, behavior: 'smooth'}})">⬆️ Lên đầu</button>
    </div>

    <div class="paper-container" id="report-content">
        {cover_html}
        {html_body}
    </div>

    <script>
        // Preview image upon file selection
        function previewImage(input, event) {{
            event.stopPropagation();
            if (input.files && input.files[0]) {{
                const reader = new FileReader();
                const container = input.parentElement;
                const img = container.querySelector('.preview-img');
                const title = container.querySelector('.placeholder-title');
                const hint = container.querySelector('.placeholder-hint');
                const icon = container.querySelector('.placeholder-icon');

                reader.onload = function(e) {{
                    img.src = e.target.result;
                    img.style.display = 'block';
                    if (icon) icon.style.display = 'none';
                    if (hint) hint.style.display = 'none';
                    container.style.border = '1px solid #cbd5e1';
                    container.style.background = '#ffffff';
                }}
                reader.readAsDataURL(input.files[0]);
            }}
        }}

        // Allow drag and drop on image placeholder boxes
        document.querySelectorAll('.image-placeholder-box').forEach(box => {{
            box.addEventListener('dragover', (e) => {{
                e.preventDefault();
                box.style.borderColor = '#2563eb';
                box.style.backgroundColor = '#dbeafe';
            }});
            box.addEventListener('dragleave', (e) => {{
                e.preventDefault();
                box.style.borderColor = '#4f46e5';
                box.style.backgroundColor = '#f8fafc';
            }});
            box.addEventListener('drop', (e) => {{
                e.preventDefault();
                box.style.borderColor = '#4f46e5';
                box.style.backgroundColor = '#f8fafc';
                const fileInput = box.querySelector('input[type=file]');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {{
                    fileInput.files = e.dataTransfer.files;
                    const changeEvent = new Event('change');
                    fileInput.dispatchEvent(changeEvent);
                }}
            }});
        }});

        // Fix TOC anchor links to match generated heading IDs
        window.addEventListener('DOMContentLoaded', () => {{
            document.querySelectorAll('a[href^="#"]').forEach(a => {{
                const rawHash = decodeURIComponent(a.getAttribute('href').substring(1)).trim();
                if (!document.getElementById(rawHash)) {{
                    // Try to match by text similarity or normalized slug
                    const headings = document.querySelectorAll('h1, h2, h3, h4');
                    for (const h of headings) {{
                        const hText = h.textContent.trim().toLowerCase();
                        const linkText = a.textContent.trim().toLowerCase();
                        if (hText === linkText || h.id.replace(/-/g, '') === rawHash.replace(/[^a-zA-Z0-9]/g, '')) {{
                            a.setAttribute('href', '#' + h.id);
                            break;
                        }}
                    }}
                }}
            }});
        }});

        // Copy entire document content to clipboard for easy paste into Microsoft Word
        function copyDocumentToClipboard() {{
            const content = document.getElementById('report-content');
            const range = document.createRange();
            range.selectNode(content);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            try {{
                document.execCommand('copy');
                alert('Đã sao chép toàn bộ nội dung báo cáo! Bạn chỉ cần mở Microsoft Word và nhấn Ctrl + V để dán.');
            }} catch (err) {{
                alert('Không thể tự động sao chép. Bạn có thể nhấn Ctrl + A rồi Ctrl + C.');
            }}
            window.getSelection().removeAllRanges();
        }}
    </script>
</body>
</html>
'''

with open(html_path, "w", encoding="utf-8") as f:
    f.write(full_html)

print("Exported successfully to:", html_path)
