import os
import subprocess

IMAGES_DIR = r"c:\laragon\www\QLPM\images"
os.makedirs(IMAGES_DIR, exist_ok=True)

output_png = os.path.join(IMAGES_DIR, "hinh_3_1_use_case_tong_quat.png")

html_content = '''<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: "Segoe UI", Arial, sans-serif;
    background: #ffffff;
    margin: 0;
    padding: 24px;
    display: flex;
    justify-content: center;
  }
  .diagram-container {
    width: 1400px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    overflow: hidden;
  }
  .diagram-title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #1e3a8a;
    padding: 16px;
    background: #eff6ff;
    border-bottom: 2px solid #bfdbfe;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .canvas {
    position: relative;
    height: 1100px;
    background: #ffffff;
  }
  
  /* System Boundary */
  .system-boundary {
    position: absolute;
    left: 260px;
    top: 30px;
    width: 880px;
    height: 1040px;
    border: 2px solid #3b82f6;
    border-radius: 12px;
    background: #fafafa;
    box-shadow: inset 0 2px 10px rgba(59, 130, 246, 0.04);
  }
  .system-title {
    position: absolute;
    left: 280px;
    top: 42px;
    font-size: 14px;
    font-weight: bold;
    color: #1d4ed8;
    background: #eff6ff;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid #bfdbfe;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Subsystem Packages */
  .subsystem-box {
    position: absolute;
    border: 1px dashed #94a3b8;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.7);
  }
  .subsystem-label {
    position: absolute;
    top: -10px;
    left: 14px;
    font-size: 11px;
    font-weight: bold;
    color: #475569;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
  }

  /* Actors */
  .actor-card {
    position: absolute;
    width: 170px;
    text-align: center;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    padding: 14px 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    z-index: 10;
  }
  .actor-title {
    font-size: 14px;
    font-weight: bold;
    color: #0f172a;
    margin-top: 8px;
  }
  .actor-sub {
    font-size: 11.5px;
    color: #64748b;
  }

  /* Use Case Ellipse */
  .usecase {
    position: absolute;
    width: 210px;
    height: 48px;
    background: #ffffff;
    border: 1.5px solid #2563eb;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 12.5px;
    font-weight: 600;
    color: #1e3a8a;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.08);
    transition: all 0.2s;
    z-index: 5;
    padding: 0 10px;
    line-height: 1.25;
  }
  .usecase.common {
    border-color: #64748b;
    color: #334155;
    background: #f8fafc;
  }
  .usecase.student {
    border-color: #0284c7;
    color: #0369a1;
    background: #f0f9ff;
  }
  .usecase.employer {
    border-color: #059669;
    color: #065f46;
    background: #ecfdf5;
  }
  .usecase.admin {
    border-color: #7c3aed;
    color: #5b21b6;
    background: #faf5ff;
  }

  /* SVG Lines */
  .svg-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
  }
  .line-student {
    stroke: #0284c7;
    stroke-width: 1.5;
  }
  .line-employer {
    stroke: #059669;
    stroke-width: 1.5;
  }
  .line-admin {
    stroke: #7c3aed;
    stroke-width: 1.5;
  }
  .line-common {
    stroke: #64748b;
    stroke-width: 1.2;
    stroke-dasharray: 4, 3;
  }
  .rel-text {
    font-size: 10px;
    font-style: italic;
    fill: #dc2626;
    font-weight: bold;
  }
</style>
</head>
<body>
<div class="diagram-container">
  <div class="diagram-title">Hình 3.1: Sơ đồ Use case tổng quát của hệ thống InternHub</div>
  <div class="canvas">
    
    <!-- System Boundary -->
    <div class="system-boundary"></div>
    <div class="system-title">Hệ thống Nền tảng Tuyển dụng Thực tập (InternHub)</div>

    <!-- Package: Auth & Common -->
    <div class="subsystem-box" style="left: 280px; top: 90px; width: 840px; height: 110px;">
      <div class="subsystem-label">Phân hệ Xác thực & Tài khoản chung</div>
    </div>

    <!-- Package: Student -->
    <div class="subsystem-box" style="left: 280px; top: 220px; width: 405px; height: 570px;">
      <div class="subsystem-label">Phân hệ Sinh viên (Ứng viên)</div>
    </div>

    <!-- Package: Employer -->
    <div class="subsystem-box" style="left: 715px; top: 220px; width: 405px; height: 570px;">
      <div class="subsystem-label">Phân hệ Nhà tuyển dụng (Doanh nghiệp)</div>
    </div>

    <!-- Package: Admin -->
    <div class="subsystem-box" style="left: 280px; top: 810px; width: 840px; height: 240px;">
      <div class="subsystem-label">Phân hệ Quản trị viên (Admin Portal)</div>
    </div>

    <!-- SVG Associations -->
    <svg class="svg-canvas">
      <defs>
        <marker id="arrow-rel" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      <!-- ACTOR 1 (Sinh vien) lines (center approx 215, 480) -->
      <!-- Common Auth -->
      <path d="M 215 440 L 410 145" class="line-student" />
      <path d="M 215 450 L 695 145" class="line-student" />
      
      <!-- Student Usecases -->
      <path d="M 215 460 L 390 265" class="line-student" />
      <path d="M 215 470 L 390 335" class="line-student" />
      <path d="M 215 480 L 390 405" class="line-student" />
      <path d="M 215 490 L 390 545" class="line-student" />
      <path d="M 215 500 L 390 615" class="line-student" />
      <path d="M 215 510 L 390 685" class="line-student" />
      <path d="M 215 520 L 390 755" class="line-student" />

      <!-- Shared Messenger from Student -->
      <path d="M 215 530 L 600 755" class="line-student" />

      <!-- ACTOR 2 (Employer) lines (center approx 1185, 400) -->
      <!-- Common Auth -->
      <path d="M 1185 360 L 805 145" class="line-employer" />
      <path d="M 1185 370 L 610 145" class="line-employer" />
      <!-- Employer Usecases -->
      <path d="M 1185 380 L 1015 265" class="line-employer" />
      <path d="M 1185 390 L 1015 335" class="line-employer" />
      <path d="M 1185 400 L 1015 405" class="line-employer" />
      <path d="M 1185 410 L 1015 475" class="line-employer" />
      <path d="M 1185 420 L 1015 545" class="line-employer" />
      <path d="M 1185 430 L 1015 615" class="line-employer" />
      <path d="M 1185 440 L 1015 685" class="line-employer" />
      <!-- Shared Messenger from Employer -->
      <path d="M 1185 450 L 800 755" class="line-employer" />

      <!-- ACTOR 3 (Admin) lines (center approx 1185, 930) -->
      <path d="M 1185 890 L 610 145" class="line-admin" />
      <path d="M 1185 910 L 910 865" class="line-admin" />
      <path d="M 1185 920 L 910 935" class="line-admin" />
      <path d="M 1185 930 L 910 1005" class="line-admin" />
      <path d="M 1185 900 L 590 865" class="line-admin" />
      <path d="M 1185 910 L 590 935" class="line-admin" />

      <!-- <<extend>> relationship between Scan CV and Recommend Jobs -->
      <path d="M 485 430 L 485 470" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4, 3" marker-end="url(#arrow-rel)" />
      <text x="495" y="455" class="rel-text">&lt;&lt;extend&gt;&gt;</text>

      <!-- <<include>> between Update Status and Manage Applications -->
      <path d="M 910 590 L 910 570" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4, 3" marker-end="url(#arrow-rel)" />
      <text x="918" y="585" class="rel-text">&lt;&lt;include&gt;&gt;</text>
    </svg>

    <!-- ACTOR 1: Sinh viên -->
    <div class="actor-card" style="left: 45px; top: 410px;">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="7" r="4"></circle>
        <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"></path>
      </svg>
      <div class="actor-title">Sinh viên</div>
      <div class="actor-sub">(Ứng viên tìm thực tập)</div>
    </div>

    <!-- ACTOR 2: Nhà tuyển dụng -->
    <div class="actor-card" style="left: 1185px; top: 330px;">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"></rect>
        <path d="M9 22v-4h6v4"></path>
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"></path>
      </svg>
      <div class="actor-title">Nhà tuyển dụng</div>
      <div class="actor-sub">(Doanh nghiệp / HR)</div>
    </div>

    <!-- ACTOR 3: Quản trị viên -->
    <div class="actor-card" style="left: 1185px; top: 850px;">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
      <div class="actor-title">Quản trị viên</div>
      <div class="actor-sub">(Admin hệ thống)</div>
    </div>

    <!-- USE CASES: COMMON (Top Box) -->
    <div class="usecase common" style="left: 310px; top: 120px;">Đăng ký tài khoản</div>
    <div class="usecase common" style="left: 595px; top: 120px;">Đăng nhập hệ thống (JWT)</div>
    <div class="usecase common" style="left: 880px; top: 120px;">Quản lý tài khoản & Mật khẩu</div>

    <!-- USE CASES: STUDENT (Left Box) -->
    <div class="usecase student" style="left: 380px; top: 240px;">Quản lý hồ sơ cá nhân</div>
    <div class="usecase student" style="left: 380px; top: 310px;">Tạo CV trực tuyến (CV Studio)</div>
    <div class="usecase student" style="left: 380px; top: 380px; border-width: 2px;">Tải lên & Quét phân tích CV</div>
    <div class="usecase student" style="left: 380px; top: 470px; border-width: 2px;">Xem việc làm phù hợp (% match)</div>
    <div class="usecase student" style="left: 380px; top: 540px;">Tìm kiếm & Lọc việc làm</div>
    <div class="usecase student" style="left: 380px; top: 610px;">Lưu tin tuyển dụng yêu thích</div>
    <div class="usecase student" style="left: 380px; top: 680px; border-width: 2px;">Nộp hồ sơ ứng tuyển</div>
    <div class="usecase student" style="left: 380px; top: 750px;">Theo dõi trạng thái đơn đã nộp</div>

    <!-- SHARED MESSENGER USE CASE (Between Student and Employer) -->
    <div class="usecase" style="left: 595px; top: 730px; border-color: #2563eb; background: #eff6ff; width: 210px; font-weight: bold;">Nhắn tin trực tiếp (Chat Messenger)</div>

    <!-- USE CASES: EMPLOYER (Right Box) -->
    <div class="usecase employer" style="left: 810px; top: 240px;">Khai báo hồ sơ công ty</div>
    <div class="usecase employer" style="left: 810px; top: 310px;">Đăng tin tuyển dụng thực tập</div>
    <div class="usecase employer" style="left: 810px; top: 380px;">Quản lý tin (Sửa / Đóng tin)</div>
    <div class="usecase employer" style="left: 810px; top: 450px; border-width: 2px;">Quản lý danh sách ứng viên</div>
    <div class="usecase employer" style="left: 810px; top: 520px;">Xem chi tiết CV & Thư ứng tuyển</div>
    <div class="usecase employer" style="left: 810px; top: 590px; border-width: 2px;">Cập nhật trạng thái duyệt đơn</div>
    <div class="usecase employer" style="left: 810px; top: 660px;">Xem thống kê số liệu tuyển dụng</div>

    <!-- USE CASES: ADMIN (Bottom Box) -->
    <div class="usecase admin" style="left: 380px; top: 840px;">Kiểm duyệt tin tuyển dụng</div>
    <div class="usecase admin" style="left: 380px; top: 920px;">Quản lý người dùng & Khóa TK</div>
    <div class="usecase admin" style="left: 700px; top: 840px;">Quản lý danh mục Kỹ năng / Ngành</div>
    <div class="usecase admin" style="left: 700px; top: 920px;">Tiếp nhận & Xử lý báo cáo vi phạm</div>
    <div class="usecase admin" style="left: 700px; top: 990px;">Xem nhật ký hoạt động hệ thống</div>

  </div>
</div>
</body>
</html>
'''

temp_html = output_png.replace(".png", "_temp.html")
with open(temp_html, "w", encoding="utf-8") as f:
    f.write(html_content)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
file_url = "file:///" + temp_html.replace("\\", "/")
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--window-size=1450,1180",
    f"--screenshot={output_png}",
    "--hide-scrollbars",
    file_url
]
subprocess.run(cmd, check=True)
if os.path.exists(temp_html):
    os.remove(temp_html)
print(f"Generated Use Case diagram successfully at: {output_png}")
