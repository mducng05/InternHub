import os
import subprocess
import shutil

IMAGES_DIR = r"c:\laragon\www\QLPM\images"
os.makedirs(IMAGES_DIR, exist_ok=True)

# 1. Process ERD image from previous step
clean_erd = os.path.join(IMAGES_DIR, "erd_diagram_clean.png")
target_erd = os.path.join(IMAGES_DIR, "hinh_3_5_erd_database.png")
if os.path.exists(clean_erd):
    shutil.copy(clean_erd, target_erd)
    print("ERD image copied to:", target_erd)

# Helper function to render HTML/SVG diagram to high-resolution PNG using Edge headless
def render_html_to_png(html_content, output_png_path, width=1350, height=1100):
    temp_html = output_png_path.replace(".png", "_temp.html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    file_url = "file:///" + temp_html.replace("\\", "/")
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        f"--window-size={width},{height}",
        f"--screenshot={output_png_path}",
        "--hide-scrollbars",
        file_url
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(temp_html):
        os.remove(temp_html)
    print(f"Rendered diagram to {output_png_path}")

# ==========================================
# DIAGRAM 1: Activity Diagram - Login & JWT
# ==========================================
html_diagram_3_2 = '''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: "Segoe UI", Arial, sans-serif; background: #ffffff; margin: 0; padding: 20px; display: flex; justify-content: center; }
  .diagram-container { width: 1280px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden; }
  .diagram-title { text-align: center; font-size: 20px; font-weight: bold; color: #1e3a8a; padding: 14px; background: #eff6ff; border-bottom: 2px solid #bfdbfe; text-transform: uppercase; }
  .swimlanes { display: grid; grid-template-columns: 280px 320px 380px 300px; border-bottom: 1px solid #cbd5e1; }
  .lane-header { font-weight: bold; font-size: 15px; text-align: center; padding: 10px; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2); }
  .lane-1 { background: #3b82f6; }
  .lane-2 { background: #0ea5e9; }
  .lane-3 { background: #6366f1; }
  .lane-4 { background: #8b5cf6; }
  .canvas { position: relative; height: 860px; background: #ffffff; }
  .lane-dividers { position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: grid; grid-template-columns: 280px 320px 380px 300px; pointer-events: none; }
  .divider { border-right: 1px dashed #cbd5e1; height: 100%; }
  
  /* Nodes styling */
  .node { position: absolute; border-radius: 8px; font-size: 13px; text-align: center; padding: 10px 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-weight: 500; display: flex; align-items: center; justify-content: center; }
  .start-node { width: 28px; height: 28px; background: #10b981; border: 3px solid #059669; border-radius: 50%; padding: 0; }
  .end-node { width: 30px; height: 30px; background: #ffffff; border: 3px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; }
  .end-inner { width: 16px; height: 16px; background: #ef4444; border-radius: 50%; }
  .action-user { background: #eff6ff; border: 1.5px solid #3b82f6; color: #1e3a8a; }
  .action-client { background: #f0fdf4; border: 1.5px solid #10b981; color: #065f46; }
  .action-server { background: #eef2ff; border: 1.5px solid #6366f1; color: #3730a3; }
  .action-db { background: #faf5ff; border: 1.5px solid #8b5cf6; color: #5b21b6; }
  .decision-node { width: 140px; height: 60px; background: #fffbeb; border: 1.5px solid #f59e0b; color: #92400e; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); font-size: 11.5px; font-weight: bold; }
  .svg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
</style>
</head>
<body>
<div class="diagram-container">
  <div class="diagram-title">Hình 3.2: Sơ đồ hoạt động luồng Đăng nhập & Xác thực JWT</div>
  <div class="swimlanes">
    <div class="lane-header lane-1">1. Người dùng (Sinh viên / NTD)</div>
    <div class="lane-header lane-2">2. Giao diện (React SPA)</div>
    <div class="lane-header lane-3">3. Máy chủ (Django REST Framework)</div>
    <div class="lane-header lane-4">4. Cơ sở dữ liệu (MySQL)</div>
  </div>
  <div class="canvas">
    <div class="lane-dividers">
      <div class="divider"></div><div class="divider"></div><div class="divider"></div><div></div>
    </div>
    <svg class="svg-overlay">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>
      <!-- Connections -->
      <path d="M 140 48 L 140 75" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 140 135 L 140 165" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 230 195 L 340 195" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 440 225 L 440 255" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 540 375 L 680 375" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Validation Fail -->
      <path d="M 440 315 L 440 340" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Server to DB -->
      <path d="M 870 375 L 1050 375" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 1140 410 L 1140 440" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 1050 470 L 870 470" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Decision Server -->
      <path d="M 790 500 L 790 530" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Fail Path -->
      <path d="M 720 560 L 540 560" stroke="#dc2626" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrow-red)" />
      <!-- Success Path -->
      <path d="M 790 590 L 790 625" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Tokens returned -->
      <path d="M 690 660 L 530 660" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Client store and redirect -->
      <path d="M 440 690 L 440 725" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 350 755 L 230 755" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 140 790 L 140 815" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
    </svg>

    <!-- Lane 1: User -->
    <div class="node start-node" style="left: 126px; top: 20px;"></div>
    <div class="node action-user" style="left: 45px; top: 75px; width: 190px;">Mở trang Đăng nhập (/login)</div>
    <div class="node action-user" style="left: 45px; top: 165px; width: 190px;">Nhập Email & Mật khẩu<br>Nhấn nút "Đăng nhập"</div>
    <div class="node action-user" style="left: 45px; top: 725px; width: 190px; background:#dcfce7; border-color:#22c55e;">Vào trang Bảng điều khiển<br>theo vai trò (Student/Employer)</div>
    <div class="node end-node" style="left: 125px; top: 815px;"><div class="end-inner"></div></div>

    <!-- Lane 2: Client React SPA -->
    <div class="node action-client" style="left: 340px; top: 165px; width: 200px;">Kiểm tra định dạng email<br>& mật khẩu không được rỗng</div>
    <div class="node decision-node" style="left: 370px; top: 255px;">Hợp lệ?</div>
    <div class="node action-client" style="left: 340px; top: 345px; width: 200px;">Gửi POST /api/v1/auth/jwt/create/<br>(payload: email, password)</div>
    <div class="node action-client" style="left: 340px; top: 535px; width: 200px; background:#fee2e2; border-color:#ef4444; color:#991b1b;">Hiển thị thông báo lỗi:<br>"Email hoặc mật khẩu không đúng"</div>
    <div class="node action-client" style="left: 340px; top: 630px; width: 200px;">Lưu access_token & refresh_token<br>vào localStorage / AuthContext</div>
    <div class="node action-client" style="left: 340px; top: 725px; width: 200px;">Điều hướng đến Dashboard<br>(theo role: student / employer)</div>

    <!-- Lane 3: Server DRF -->
    <div class="node action-server" style="left: 680px; top: 345px; width: 220px;">Tiếp nhận request JWT<br>Gọi serializer kiểm tra dữ liệu</div>
    <div class="node action-server" style="left: 680px; top: 440px; width: 220px;">Đối soát mật khẩu mã hóa<br>bằng thuật toán bcrypt / PBKDF2</div>
    <div class="node decision-node" style="left: 720px; top: 530px;">Xác thực<br>thành công?</div>
    <div class="node action-server" style="left: 690px; top: 625px; width: 200px;">Cấp phát cặp JWT:<br>access (60m) & refresh (7d)</div>

    <!-- Lane 4: Database -->
    <div class="node action-db" style="left: 1050px; top: 345px; width: 180px;">SELECT user FROM accounts_user<br>WHERE email = ? AND is_active = 1</div>
    <div class="node action-db" style="left: 1050px; top: 440px; width: 180px;">Trả về bản ghi user<br>(password hash, role, status)</div>
  </div>
</div>
</body>
</html>
'''

# ==========================================
# DIAGRAM 2: Activity Diagram - CV Scan & Rec
# ==========================================
html_diagram_3_3 = '''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: "Segoe UI", Arial, sans-serif; background: #ffffff; margin: 0; padding: 20px; display: flex; justify-content: center; }
  .diagram-container { width: 1280px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden; }
  .diagram-title { text-align: center; font-size: 20px; font-weight: bold; color: #1e3a8a; padding: 14px; background: #eff6ff; border-bottom: 2px solid #bfdbfe; text-transform: uppercase; }
  .swimlanes { display: grid; grid-template-columns: 280px 320px 400px 280px; border-bottom: 1px solid #cbd5e1; }
  .lane-header { font-weight: bold; font-size: 15px; text-align: center; padding: 10px; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2); }
  .lane-1 { background: #0284c7; }
  .lane-2 { background: #0d9488; }
  .lane-3 { background: #4f46e5; }
  .lane-4 { background: #7c3aed; }
  .canvas { position: relative; height: 900px; background: #ffffff; }
  .lane-dividers { position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: grid; grid-template-columns: 280px 320px 400px 280px; pointer-events: none; }
  .divider { border-right: 1px dashed #cbd5e1; height: 100%; }
  
  /* Nodes styling */
  .node { position: absolute; border-radius: 8px; font-size: 13px; text-align: center; padding: 10px 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-weight: 500; display: flex; align-items: center; justify-content: center; }
  .start-node { width: 28px; height: 28px; background: #10b981; border: 3px solid #059669; border-radius: 50%; padding: 0; }
  .end-node { width: 30px; height: 30px; background: #ffffff; border: 3px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; }
  .end-inner { width: 16px; height: 16px; background: #ef4444; border-radius: 50%; }
  .action-user { background: #f0f9ff; border: 1.5px solid #0284c7; color: #0369a1; }
  .action-client { background: #f0fdfa; border: 1.5px solid #0d9488; color: #115e59; }
  .action-server { background: #eef2ff; border: 1.5px solid #4f46e5; color: #3730a3; }
  .action-db { background: #faf5ff; border: 1.5px solid #7c3aed; color: #5b21b6; }
  .decision-node { width: 140px; height: 60px; background: #fffbeb; border: 1.5px solid #f59e0b; color: #92400e; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); font-size: 11.5px; font-weight: bold; }
  .svg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
</style>
</head>
<body>
<div class="diagram-container">
  <div class="diagram-title">Hình 3.3: Sơ đồ hoạt động luồng Quét CV & Gợi ý việc làm thực tập</div>
  <div class="swimlanes">
    <div class="lane-header lane-1">1. Sinh viên (Ứng viên)</div>
    <div class="lane-header lane-2">2. Giao diện (CV Studio & Modal)</div>
    <div class="lane-header lane-3">3. Backend (CV Scanner & Scoring Engine)</div>
    <div class="lane-header lane-4">4. CSDL (MySQL)</div>
  </div>
  <div class="canvas">
    <div class="lane-dividers">
      <div class="divider"></div><div class="divider"></div><div class="divider"></div><div></div>
    </div>
    <svg class="svg-overlay">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
        </marker>
      </defs>
      <!-- Connections -->
      <path d="M 140 48 L 140 75" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 140 135 L 140 165" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 235 195 L 330 195" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 430 225 L 430 260" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 530 295 L 670 295" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 800 330 L 800 365" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 800 425 L 800 460" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Match against DB jobs -->
      <path d="M 930 495 L 1050 495" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 1050 550 L 930 550" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 800 580 L 800 615" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Return recommendations -->
      <path d="M 670 650 L 530 650" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 430 685 L 430 720" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- User view & action -->
      <path d="M 330 755 L 235 755" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 140 790 L 140 825" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Optional save to DB -->
      <path d="M 235 845 L 1050 845" stroke="#059669" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrow)" />
    </svg>

    <!-- Lane 1: User -->
    <div class="node start-node" style="left: 126px; top: 20px;"></div>
    <div class="node action-user" style="left: 45px; top: 75px; width: 190px;">Truy cập CV Studio<br>hoặc bấm "Quét CV tìm việc"</div>
    <div class="node action-user" style="left: 45px; top: 165px; width: 190px;">Tải lên tệp CV (.PDF / .DOCX)<br>hoặc chọn CV đã có trong hồ sơ</div>
    <div class="node action-user" style="left: 45px; top: 720px; width: 190px; background:#eff6ff; border-color:#3b82f6;">Xem kết quả phân tích &<br>Danh sách Job phù hợp (sắp xếp %)</div>
    <div class="node action-user" style="left: 45px; top: 820px; width: 190px; background:#dcfce7; border-color:#22c55e;">(Tùy chọn) Nhấn "Lưu vào hồ sơ"<br>& Nộp đơn cho Job phù hợp</div>

    <!-- Lane 2: Client React -->
    <div class="node action-client" style="left: 330px; top: 165px; width: 200px;">Hiển thị Modal Quét CV &<br>Animation loading quét tệp</div>
    <div class="node action-client" style="left: 330px; top: 260px; width: 200px;">Gửi POST Multipart / FormData<br>/api/v1/profiles/student/recommend-from-cv/</div>
    <div class="node action-client" style="left: 330px; top: 615px; width: 200px;">Nhận JSON phân tích:<br>skills, candidate info, recommended jobs</div>
    <div class="node action-client" style="left: 330px; top: 720px; width: 200px;">Render Badge % phù hợp, tag Kỹ năng<br>(✓ Java, ✓ Python) & Kỹ năng thiếu (+ Docker)</div>

    <!-- Lane 3: Backend Python -->
    <div class="node action-server" style="left: 670px; top: 260px; width: 260px;">Bóc tách văn bản thô (Raw text):<br>Dùng pdfminer.six (PDF) hoặc python-docx (DOCX)</div>
    <div class="node action-server" style="left: 670px; top: 365px; width: 260px;">Chuẩn hóa chuỗi NFC & Regex<br>Trích xuất: SĐT, Email, Tỉnh/Thành</div>
    <div class="node action-server" style="left: 670px; top: 460px; width: 260px;">Trích xuất Kỹ năng qua biên từ Unicode<br>(?&lt;!\w)skill(?!\w) từ từ điển KN và CSDL</div>
    <div class="node action-server" style="left: 670px; top: 615px; width: 260px;">Tính điểm tương thích có trọng số:<br>Score = 60% Skill + 25% Major + 15% Location<br>Sắp xếp danh sách Job theo % giảm dần</div>

    <!-- Lane 4: Database -->
    <div class="node action-db" style="left: 1050px; top: 460px; width: 180px;">SELECT jobs FROM jobs_job<br>WHERE status = 'approved'<br>AND deadline >= TODAY()</div>
    <div class="node action-db" style="left: 1050px; top: 530px; width: 180px;">Lấy danh mục kỹ năng<br>catalog_skill & jobs_jobskill</div>
    <div class="node action-db" style="left: 1050px; top: 820px; width: 180px; background:#dcfce7; border-color:#10b981;">INSERT INTO catalog_studentskill<br>(Lưu kỹ năng quét được)</div>
  </div>
</div>
</body>
</html>
'''

# ==========================================
# DIAGRAM 3: Activity Diagram - Application Workflow
# ==========================================
html_diagram_3_4 = '''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: "Segoe UI", Arial, sans-serif; background: #ffffff; margin: 0; padding: 20px; display: flex; justify-content: center; }
  .diagram-container { width: 1280px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden; }
  .diagram-title { text-align: center; font-size: 20px; font-weight: bold; color: #1e3a8a; padding: 14px; background: #eff6ff; border-bottom: 2px solid #bfdbfe; text-transform: uppercase; }
  .swimlanes { display: grid; grid-template-columns: 300px 380px 340px 260px; border-bottom: 1px solid #cbd5e1; }
  .lane-header { font-weight: bold; font-size: 15px; text-align: center; padding: 10px; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2); }
  .lane-1 { background: #2563eb; }
  .lane-2 { background: #4f46e5; }
  .lane-3 { background: #059669; }
  .lane-4 { background: #7c3aed; }
  .canvas { position: relative; height: 920px; background: #ffffff; }
  .lane-dividers { position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: grid; grid-template-columns: 300px 380px 340px 260px; pointer-events: none; }
  .divider { border-right: 1px dashed #cbd5e1; height: 100%; }
  
  /* Nodes styling */
  .node { position: absolute; border-radius: 8px; font-size: 13px; text-align: center; padding: 10px 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-weight: 500; display: flex; align-items: center; justify-content: center; }
  .start-node { width: 28px; height: 28px; background: #10b981; border: 3px solid #059669; border-radius: 50%; padding: 0; }
  .end-node { width: 30px; height: 30px; background: #ffffff; border: 3px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; }
  .end-inner { width: 16px; height: 16px; background: #ef4444; border-radius: 50%; }
  .action-user { background: #eff6ff; border: 1.5px solid #2563eb; color: #1e3a8a; }
  .action-server { background: #eef2ff; border: 1.5px solid #4f46e5; color: #3730a3; }
  .action-ntd { background: #ecfdf5; border: 1.5px solid #059669; color: #065f46; }
  .action-db { background: #faf5ff; border: 1.5px solid #7c3aed; color: #5b21b6; }
  .decision-node { width: 140px; height: 60px; background: #fffbeb; border: 1.5px solid #f59e0b; color: #92400e; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); font-size: 11.5px; font-weight: bold; }
  .svg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
</style>
</head>
<body>
<div class="diagram-container">
  <div class="diagram-title">Hình 3.4: Sơ đồ hoạt động luồng Nộp hồ sơ & Chuyển trạng thái tuyển dụng</div>
  <div class="swimlanes">
    <div class="lane-header lane-1">1. Sinh viên (Ứng viên)</div>
    <div class="lane-header lane-2">2. Hệ thống (API & State Machine)</div>
    <div class="lane-header lane-3">3. Nhà tuyển dụng (Doanh nghiệp)</div>
    <div class="lane-header lane-4">4. Cơ sở dữ liệu (MySQL)</div>
  </div>
  <div class="canvas">
    <div class="lane-dividers">
      <div class="divider"></div><div class="divider"></div><div class="divider"></div><div></div>
    </div>
    <svg class="svg-overlay">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>
      <!-- Connections -->
      <path d="M 150 48 L 150 75" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 150 135 L 150 165" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 255 195 L 360 195" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Check unique -->
      <path d="M 480 225 L 480 260" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Already applied path -->
      <path d="M 410 290 L 255 290" stroke="#dc2626" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrow-red)" />
      <!-- Not yet applied path -->
      <path d="M 480 320 L 480 355" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 600 385 L 1060 385" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Notify Employer -->
      <path d="M 480 415 L 480 470" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 600 500 L 730 500" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Employer reviews -->
      <path d="M 850 530 L 850 570" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Update status -->
      <path d="M 850 630 L 850 670" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 730 700 L 600 700" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <!-- State machine logs and notifies student -->
      <path d="M 600 730 L 1060 730" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 360 700 L 255 700" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 150 740 L 150 780" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 150 835 L 150 860" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
    </svg>

    <!-- Lane 1: Student -->
    <div class="node start-node" style="left: 136px; top: 20px;"></div>
    <div class="node action-user" style="left: 45px; top: 75px; width: 210px;">Xem chi tiết công việc thực tập<br>& Kiểm tra quyền lợi, yêu cầu</div>
    <div class="node action-user" style="left: 45px; top: 165px; width: 210px;">Nhập thư giới thiệu (Cover letter)<br>& Đính kèm CV -> Bấm "Ứng tuyển"</div>
    <div class="node action-user" style="left: 45px; top: 260px; width: 210px; background:#fee2e2; border-color:#ef4444; color:#991b1b;">Hiển thị lỗi:<br>"Bạn đã nộp đơn cho vị trí này"</div>
    <div class="node action-user" style="left: 45px; top: 670px; width: 210px; background:#eff6ff; border-color:#3b82f6;">Nhận thông báo chuông &<br>Email thay đổi trạng thái hồ sơ</div>
    <div class="node action-user" style="left: 45px; top: 780px; width: 210px; background:#f0fdf4; border-color:#10b981;">Nhắn tin xác nhận lịch phỏng vấn<br>với Nhà tuyển dụng qua Messenger</div>
    <div class="node end-node" style="left: 135px; top: 860px;"><div class="end-inner"></div></div>

    <!-- Lane 2: Backend System -->
    <div class="node action-server" style="left: 360px; top: 165px; width: 240px;">Tiếp nhận POST /api/v1/applications/<br>(job_id, cover_letter, cv_snapshot)</div>
    <div class="node decision-node" style="left: 410px; top: 260px;">Đã từng<br>nộp đơn?</div>
    <div class="node action-server" style="left: 360px; top: 355px; width: 240px;">Tạo bản ghi mới (status='pending')<br>& Khởi tạo chat_conversation</div>
    <div class="node action-server" style="left: 360px; top: 470px; width: 240px;">Bắn thông báo chuông (Notification)<br>đến tài khoản Nhà tuyển dụng</div>
    <div class="node action-server" style="left: 360px; top: 670px; width: 240px;">Kiểm tra chuyển trạng thái hợp lệ<br>(pending -> shortlisted -> interview)</div>

    <!-- Lane 3: Employer -->
    <div class="node action-ntd" style="left: 730px; top: 470px; width: 240px;">Nhận thông báo hồ sơ mới<br>Truy cập Bảng điều khiển NTD</div>
    <div class="node action-ntd" style="left: 730px; top: 570px; width: 240px;">Xem bản tệp CV ứng viên,<br>thư giới thiệu & % điểm phù hợp</div>
    <div class="node action-ntd" style="left: 730px; top: 670px; width: 240px;">Đổi trạng thái hồ sơ:<br>[Mời phỏng vấn] hoặc [Từ chối]</div>

    <!-- Lane 4: Database -->
    <div class="node action-db" style="left: 1060px; top: 355px; width: 170px;">INSERT INTO<br>applications_application<br>(status = 'pending')</div>
    <div class="node action-db" style="left: 1060px; top: 685px; width: 170px;">UPDATE application<br>INSERT INTO<br>applicationstatuslog</div>
  </div>
</div>
</body>
</html>
'''

# Render the 3 diagrams to PNG
render_html_to_png(html_diagram_3_2, os.path.join(IMAGES_DIR, "hinh_3_2_activity_login_jwt.png"), 1320, 940)
render_html_to_png(html_diagram_3_3, os.path.join(IMAGES_DIR, "hinh_3_3_activity_cv_scan_recommendation.png"), 1320, 980)
render_html_to_png(html_diagram_3_4, os.path.join(IMAGES_DIR, "hinh_3_4_activity_application_workflow.png"), 1320, 1000)

print("All 4 diagrams have been generated successfully in:", IMAGES_DIR)
