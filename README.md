# Gợi ý việc làm thực tập cho sinh viên

Nền tảng kết nối sinh viên với vị trí thực tập, tương tự TopCV, có thêm tính năng **gợi ý cá nhân hóa** (recommendation) dựa trên kỹ năng và ngành học của sinh viên.

## Team

| Thành viên | Vai trò |
|---|---|
| Minh Đức | Backend + Leader |
| Hưng Thịnh | Frontend Developer |
| Đức Minh | Tester |

## Tech stack

| Layer | Công nghệ |
|---|---|
| Backend | Python 3.13, Django 6.1, Django REST Framework |
| Frontend | React 19 (Vite), React Router, Axios |
| Database | MySQL 8.4 (qua Laragon) |
| Auth | JWT (`djangorestframework-simplejwt`) |
| Kiểm thử API | Postman |

Môi trường dev dùng **Laragon**, đã có sẵn Python (`C:\laragon\bin\python\python-3.13`), MySQL (`C:\laragon\bin\mysql\mysql-8.4.3-winx64`) và Node.js — không cần cài thêm ngoài các bước dưới đây.

---

## 1. Cấu trúc thư mục dự án

```
QLPM/
├── backend/           # Django REST API
├── frontend/          # React app (Vite)
├── .gitignore
└── README.md          # File này
```

### 1.1. Backend (`backend/`)

```
backend/
├── venv/                       # Virtual env (KHÔNG commit)
├── config/                     # Settings, URL gốc, WSGI/ASGI
│   ├── settings.py
│   └── urls.py                 # Gắn URL của từng app vào /api/v1/...
├── apps/                       # Toàn bộ business logic chia theo domain
│   ├── accounts/               # User, đăng ký/đăng nhập, JWT, phân quyền
│   ├── profiles/               # StudentProfile, EmployerProfile
│   ├── catalog/                # Industry, Location, Skill, JobCategory (danh mục)
│   ├── jobs/                   # Job, JobSkill, JobView, SavedJob
│   ├── applications/           # Application, ApplicationStatusLog
│   ├── notifications/          # Notification, danh sách và trạng thái đã đọc
│   ├── chat/                   # Hội thoại giữa ứng viên và nhà tuyển dụng
│   ├── moderation/             # Report, duyệt tin (dành cho Admin)
│   └── common/                 # Health-check, permission/pagination dùng chung
├── media/                      # File upload (CV, avatar, logo) — KHÔNG commit
├── manage.py
├── requirements.txt
├── .env                        # Cấu hình máy local — KHÔNG commit
└── .env.example                # Mẫu để copy thành .env
```

**Quy tắc chia code trong 1 app** (áp dụng khi Minh Đức/Đức Minh thêm chức năng):
- `models.py` — bảng dữ liệu của domain đó
- `serializers.py` — validate + format JSON vào/ra
- `views.py` — xử lý request (dùng DRF `APIView`/`ViewSet`)
- `urls.py` — route riêng của app, được include vào `config/urls.py`
- `permissions.py` (nếu cần) — quy tắc ai được gọi API nào

Mỗi app chỉ động vào bảng của domain mình; nếu cần dữ liệu từ app khác thì **import model**, không lặp lại logic.

### 1.2. Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── api/            # Gọi API — 1 file/domain (client.js, auth.js, jobs.js...)
│   ├── pages/           # 1 trang = 1 file (Home, JobList, JobDetail, Login...)
│   ├── components/      # UI dùng lại nhiều nơi (Navbar, JobCard, MessengerWidget...)
│   ├── routes/          # Khai báo route + guard theo role (AppRoutes, ProtectedRoute)
│   ├── store/           # State toàn cục (AuthContext — user, token)
│   ├── hooks/           # Custom hook dùng chung
│   └── utils/           # Hàm tiện ích (format tiền, ngày...)
├── .env                 # VITE_API_URL — KHÔNG commit
└── .env.example
```

**Quy tắc**: gọi API luôn qua `src/api/*.js` (không gọi axios trực tiếp trong component), để khi backend đổi endpoint chỉ cần sửa 1 chỗ.

---

## 2. Database (MySQL) — 18 bảng

| Bảng | Chức năng | Django app |
|---|---|---|
| users | Xác thực, vai trò (student/employer/admin) | accounts |
| student_profiles | Hồ sơ sinh viên: trường, ngành, CV | profiles |
| employer_profiles | Hồ sơ doanh nghiệp | profiles |
| industries | Lĩnh vực hoạt động doanh nghiệp | catalog |
| locations | Khu vực | catalog |
| skills | Danh mục kỹ năng | catalog |
| job_categories | Danh mục vị trí công việc (Backend Dev, Marketing Intern...) | catalog |
| student_skills | Nối sinh viên ↔ kỹ năng (n-n) | catalog |
| job_skills | Nối job ↔ kỹ năng yêu cầu (n-n) — đầu vào cho gợi ý | jobs |
| jobs | Tin tuyển dụng: lương, kinh nghiệm, năm học, cờ nổi bật | jobs |
| job_views | Log lượt xem job (phục vụ dashboard employer) | jobs |
| saved_jobs | Tin đã lưu | jobs |
| applications | Đơn ứng tuyển — `UNIQUE(student, job)` | applications |
| application_status_logs | Lịch sử trạng thái đơn (timeline) | applications |
| notifications | Thông báo hệ thống | notifications |
| reports | Báo cáo vi phạm | moderation |
| conversations | Hội thoại gắn với đơn ứng tuyển | chat |
| messages | Tin nhắn trong hội thoại | chat |

Chi tiết field từng bảng: xem lịch sử thảo luận thiết kế / sẽ được thể hiện trực tiếp trong `apps/*/models.py` khi implement.

---

## 3. API design

**Base URL**: `/api/v1/`
**Auth**: JWT — gửi header `Authorization: Bearer <access_token>`. Access token sống 60 phút, refresh token 7 ngày, xoay refresh token mỗi lần dùng (`ROTATE_REFRESH_TOKENS`).

| Method | Endpoint | Mô tả | Trạng thái |
|---|---|---|---|
| POST | `/auth/token/` | Đăng nhập, trả access + refresh token | ✅ đã wire (simplejwt) |
| POST | `/auth/token/refresh/` | Lấy access token mới | ✅ đã wire |
| POST | `/auth/register/` | Đăng ký tài khoản ứng viên/nhà tuyển dụng | ✅ Đã wire |
| GET/PATCH | `/auth/me/` | Xem và cập nhật tài khoản hiện tại | ✅ Đã wire |
| GET | `/catalog/industries/`, `/locations/`, `/skills/`, `/job-categories/` | Danh mục ngành, địa điểm, kỹ năng và vị trí | ✅ Đã wire |
| GET | `/jobs/` | Danh sách tin, tìm kiếm và lọc | ✅ Đã wire |
| POST | `/jobs/manage/` | Nhà tuyển dụng tạo tin chờ duyệt | ✅ Đã wire |
| GET | `/jobs/{id}/` | Chi tiết tin đã được duyệt | ✅ Đã wire |
| PATCH | `/jobs/manage/{id}/` | Nhà tuyển dụng sửa tin của mình; đóng tin qua `/jobs/manage/{id}/close/` | ✅ Đã wire |
| POST | `/jobs/{id}/save/` | Lưu hoặc bỏ lưu tin (toggle) | ✅ Đã wire |
| GET | `/jobs/recommendations/` | Gợi ý tin theo kỹ năng và chuyên ngành (cần đăng nhập ứng viên) | ✅ Đã wire |
| GET | `/jobs/manage/` | Nhà tuyển dụng xem số liệu hồ sơ theo từng tin | ✅ Đã wire |
| POST | `/applications/` | Nộp hồ sơ; gửi thông báo cho ứng viên và nhà tuyển dụng | ✅ đã wire |
| GET | `/applications/my/` | Danh sách đơn ứng tuyển của ứng viên hiện tại | ✅ đã wire |
| PATCH | `/jobs/manage/{job_id}/applications/{application_id}/status/` | Nhà tuyển dụng cập nhật trạng thái; tạo thông báo cho ứng viên | ✅ đã wire |
| DELETE | `/applications/{id}/` | Hủy hồ sơ đang chờ xử lý của chính ứng viên | ✅ Đã wire |
| GET | `/notifications/` | Danh sách tối đa 50 thông báo của tài khoản hiện tại | ✅ đã wire |
| PATCH | `/notifications/{id}/read/` | Đánh dấu một thông báo đã đọc | ✅ đã wire |
| POST | `/notifications/read-all/` | Đánh dấu tất cả thông báo đã đọc | ✅ đã wire |
| GET | `/chat/conversations/` | Liệt kê hội thoại của ứng viên/nhà tuyển dụng | ✅ đã wire |
| POST | `/chat/conversations/` | Mở hoặc tạo hội thoại từ `application_id` | ✅ đã wire |
| GET | `/chat/conversations/{id}/messages/` | Tải tin nhắn trong hội thoại | ✅ đã wire |
| POST | `/chat/conversations/{id}/messages/` | Gửi tin nhắn (tối đa 5.000 ký tự) | ✅ đã wire |
| POST | `/moderation/reports/` | Gửi báo cáo tin tuyển dụng/người dùng; quản trị xử lý tại `/admin/reports/` | ✅ Đã wire |
| GET | `/health/` | Health check | ✅ đã wire |

Bảng trên phản ánh các luồng API hiện có. API quản trị nằm dưới `/api/v1/admin/` và được giới hạn theo quyền quản trị.

### Chat và thông báo

- Ứng viên và nhà tuyển dụng có thể bắt đầu chat từ đơn ứng tuyển; mỗi đơn có một hội thoại riêng.
- Trang chat đầy đủ nằm tại `/chat`. Khung Messenger nổi ở góc phải xuất hiện trên các trang dành cho người dùng; tin nhắn trong khung tự cập nhật khi khung đang mở.
- Chuông thông báo trên thanh điều hướng hiển thị thông báo của tài khoản hiện tại, tự kiểm tra khoảng mỗi 2 giây khi tab đang mở. Thông báo được tạo khi có đơn ứng tuyển mới, khi trạng thái đơn thay đổi và khi có tin nhắn mới.
- API chat và thông báo yêu cầu đăng nhập bằng JWT. Chỉ người tham gia đơn ứng tuyển mới có quyền xem/gửi tin nhắn trong hội thoại đó.

---

## 4. Hướng dẫn chạy dự án

### 4.1. Backend

```powershell
cd backend
python -m venv venv               #tạo venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt   #cài đặt thư viện
copy .env.example .env            # chỉnh nếu MySQL của bạn khác cấu hình mặc định
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
API chạy tại `http://127.0.0.1:8000`. Database `qlpm_internship` cần được tạo trước trong MySQL (đã tạo sẵn ở máy hiện tại qua HeidiSQL/lệnh `CREATE DATABASE`).

### 4.2. Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```
App chạy tại `http://localhost:5173`, tự động gọi API tới `VITE_API_URL` khai báo trong `.env`.

### 4.3. Cài package mới

- Backend: `pip install <package>` rồi cập nhật lại `pip freeze > requirements.txt`.
- Frontend: `npm install <package>` (tự cập nhật `package.json`).

---

## 5. Quy trình làm việc nhóm (Git)

- 1 repo duy nhất (mono-repo), 2 thư mục `backend/` và `frontend/`.
- Nhánh `main` là nhánh ổn định; mỗi người làm trên nhánh riêng theo tuần/chức năng, ví dụ: `feature/job-listing`, `feature/apply-flow`.
- Mở Pull Request để merge vào `main`; Đức Minh (Tester) review + chạy test case trước khi merge.
- Không commit `venv/`, `node_modules/`, `.env`, `media/` — đã khai báo trong `.gitignore`.
- push code:
```
git add .
git commit -m "nội dung thay đổi"
git push origin <tên-nhánh>
```
---

## 6. Roadmap 8 tuần (tham chiếu kế hoạch dự án)

| Tuần | Nội dung |
|---|---|
| 1 | Phân tích yêu cầu ✅ |
| 2 | Thiết kế hệ thống, DB, API (README này) ✅ |
| 3 | Chức năng tài khoản (auth, profile) |
| 4 | Chức năng tin tuyển dụng thực tập |
| 5 | Chức năng ứng tuyển |
| 6 | Chức năng gợi ý việc làm (rule-based: % kỹ năng khớp + ngành học + khu vực) |
| 7 | Tích hợp, hoàn thiện hệ thống — **nếu dư thời gian**: nâng cấp gợi ý bằng TF-IDF + cosine similarity |
| 8 | Hoàn thiện báo cáo, trình bày |

## 7. Trạng thái hiện tại (đã scaffold)

- ✅ Django project + các app `accounts, profiles, catalog, jobs, applications, notifications, moderation, common, admin_api, chat` — chạy được, đã kết nối MySQL qua PyMySQL.
- ✅ Custom `User` model (`role`, `phone`, `is_verified`) — đăng ký sẵn với Django Admin.
- ✅ Các bảng nghiệp vụ có model và migration; app chat thêm hai bảng `conversations` và `messages`. Chạy `python manage.py migrate` sau khi cập nhật code để tạo bảng chat.
- ✅ DRF + SimpleJWT (trả kèm `user.role` khi login) + CORS đã cấu hình, `manage.py check` pass.
- ✅ React (Vite) + React Router + Axios, cấu trúc `api/pages/components/routes/store`, `AuthContext` (login/logout, lưu token, tự refresh khi 401), route guard theo role, redirect đúng dashboard theo role sau khi login — đã test bằng Playwright (login admin → vào `/admin/dashboard`) và `npm run build` thành công.
- ✅ Chat, thông báo, luồng ứng tuyển và cập nhật trạng thái đơn đã có API nghiệp vụ; một số domain khác vẫn đang được hoàn thiện.
- ⬜ Thuật toán gợi ý việc làm (tuần 6-7).

### Tài khoản demo có sẵn (chỉ trên máy dev hiện tại)
| Email | Password | Role |
|---|---|---|
| admin@qlpm.local | Admin@123456 | admin |
| employer@qlpm.local | Employer@123456 | employer (Demo Tech Co.) |
