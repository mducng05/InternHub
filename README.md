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
│   ├── notifications/          # Notification
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
│   ├── components/      # UI dùng lại nhiều nơi (Navbar, JobCard...)
│   ├── routes/          # Khai báo route + guard theo role (AppRoutes, ProtectedRoute)
│   ├── store/           # State toàn cục (AuthContext — user, token)
│   ├── hooks/           # Custom hook dùng chung
│   └── utils/           # Hàm tiện ích (format tiền, ngày...)
├── .env                 # VITE_API_URL — KHÔNG commit
└── .env.example
```

**Quy tắc**: gọi API luôn qua `src/api/*.js` (không gọi axios trực tiếp trong component), để khi backend đổi endpoint chỉ cần sửa 1 chỗ.

---

## 2. Database (MySQL) — 16 bảng

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

Chi tiết field từng bảng: xem lịch sử thảo luận thiết kế / sẽ được thể hiện trực tiếp trong `apps/*/models.py` khi implement.

---

## 3. API design

**Base URL**: `/api/v1/`
**Auth**: JWT — gửi header `Authorization: Bearer <access_token>`. Access token sống 60 phút, refresh token 7 ngày, xoay refresh token mỗi lần dùng (`ROTATE_REFRESH_TOKENS`).

| Method | Endpoint | Mô tả | Trạng thái |
|---|---|---|---|
| POST | `/auth/token/` | Đăng nhập, trả access + refresh token | ✅ đã wire (simplejwt) |
| POST | `/auth/token/refresh/` | Lấy access token mới | ✅ đã wire |
| POST | `/auth/register/` | Đăng ký (student/employer) | ⬜ TODO |
| GET/PATCH | `/auth/me/` | Xem/sửa thông tin cá nhân | ⬜ TODO |
| GET | `/catalog/industries/`, `/locations/`, `/skills/`, `/job-categories/` | Danh mục dùng chung | ⬜ TODO |
| GET | `/jobs/` | Danh sách tin (filter: job_category, location, salary, keyword) | ⬜ TODO |
| POST | `/jobs/` | Đăng tin (employer) | ⬜ TODO |
| GET | `/jobs/{id}/` | Chi tiết tin (tăng `job_views`) | ⬜ TODO |
| PATCH/DELETE | `/jobs/{id}/` | Sửa / ẩn tin | ⬜ TODO |
| POST/DELETE | `/jobs/{id}/save/` | Lưu / bỏ lưu tin yêu thích | ⬜ TODO |
| GET | `/jobs/recommendations/` | Gợi ý việc làm cá nhân hóa | ⬜ TODO (tuần 7) |
| GET | `/jobs/{id}/stats/` | Views / Applications / Shortlisted / Interviews | ⬜ TODO |
| POST | `/applications/` | Ứng tuyển | ⬜ TODO |
| GET | `/applications/` | Danh sách đơn (theo role) | ⬜ TODO |
| PATCH | `/applications/{id}/status/` | Duyệt / từ chối / mời phỏng vấn | ⬜ TODO |
| DELETE | `/applications/{id}/` | Hủy ứng tuyển | ⬜ TODO |
| GET | `/notifications/` | Danh sách thông báo | ⬜ TODO |
| PATCH | `/notifications/{id}/read/` | Đánh dấu đã đọc | ⬜ TODO |
| GET | `/moderation/jobs/pending/` | Tin chờ duyệt (Admin) | ⬜ TODO |
| POST | `/moderation/jobs/{id}/approve\|reject/` | Duyệt/từ chối tin (Admin) | ⬜ TODO |
| GET | `/moderation/reports/` | Báo cáo vi phạm (Admin) | ⬜ TODO |
| GET | `/health/` | Health check | ✅ đã wire |

File `urls.py` của mỗi app đã tạo sẵn (comment sẵn tên route dự kiến) — chỉ cần bỏ comment và viết `views.py` tương ứng.

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

- ✅ Django project + 8 app (`accounts, profiles, catalog, jobs, applications, notifications, moderation, common`) — chạy được, đã kết nối MySQL qua PyMySQL.
- ✅ Custom `User` model (`role`, `phone`, `is_verified`) — đăng ký sẵn với Django Admin.
- ✅ **Toàn bộ 16 bảng đã có model + migration + đăng ký Django Admin** (`apps/*/models.py`, `apps/*/admin.py`) — xem mục 2 để đối chiếu bảng ↔ model. Đã seed thử 1 job demo (Backend Developer Intern, Demo Tech Co., kỹ năng Python) để xác nhận toàn bộ FK/M2M (Job → EmployerProfile → Industry, Job → JobCategory/Location, Job ↔ Skill qua `JobSkill`) hoạt động đúng.
- ✅ DRF + SimpleJWT (trả kèm `user.role` khi login) + CORS đã cấu hình, `manage.py check` pass.
- ✅ React (Vite) + React Router + Axios, cấu trúc `api/pages/components/routes/store`, `AuthContext` (login/logout, lưu token, tự refresh khi 401), route guard theo role, redirect đúng dashboard theo role sau khi login — đã test bằng Playwright (login admin → vào `/admin/dashboard`) và `npm run build` thành công.
- ⬜ Chưa viết bất kỳ `serializers.py`/`views.py` nghiệp vụ nào cho các domain khác ngoài login — các `urls.py` hiện là stub có comment sẵn route dự kiến (xem mục 3). Đây là phần việc chính còn lại: mỗi app cần `serializers.py` (validate + format JSON) và `views.py` (DRF `APIView`/`ViewSet`) rồi bỏ comment route tương ứng trong `urls.py`.
- ⬜ Thuật toán gợi ý việc làm (tuần 6-7).

### Tài khoản demo có sẵn (chỉ trên máy dev hiện tại)
| Email | Password | Role |
|---|---|---|
| admin@qlpm.local | Admin@123456 | admin |
| employer@qlpm.local | Employer@123456 | employer (Demo Tech Co.) |
