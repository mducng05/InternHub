from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.catalog.models import Industry, JobCategory, Location
from apps.profiles.models import EmployerProfile
from apps.jobs.models import Job


DEMO_JOBS = [
    {
        "key": "backend-python",
        "company": "Demo Labs",
        "email": "demo-labs@internhub.local",
        "industry": ("Công nghệ thông tin", "cong-nghe-thong-tin"),
        "title": "Thực tập sinh Backend Python",
        "category": ("Backend Developer", "backend-developer"),
        "location": ("Hà Nội", "ha-noi"),
        "description": "TIN DEMO - Tham gia xây dựng API cho sản phẩm nội bộ, phối hợp cùng đội kỹ thuật và được mentor review định kỳ.",
        "requirements": "Nắm Python cơ bản; biết HTTP/REST; có tinh thần học hỏi và làm việc nhóm.",
        "type": Job.InternshipType.FULL_TIME,
        "months": 3,
        "salary": (4_000_000, 6_000_000),
        "experience": Job.ExperienceLevel.NO_EXPERIENCE,
        "year": Job.AcademicYear.YEAR_3,
        "positions": 2,
        "days": 28,
    },
    {
        "key": "frontend-react",
        "company": "Demo Labs",
        "email": "demo-labs@internhub.local",
        "industry": ("Công nghệ thông tin", "cong-nghe-thong-tin"),
        "title": "Frontend Developer Intern",
        "category": ("Frontend Developer", "frontend-developer"),
        "location": ("Hà Nội", "ha-noi"),
        "description": "TIN DEMO - Hỗ trợ phát triển giao diện React, cải thiện khả năng responsive và tiếp cận quy trình triển khai sản phẩm.",
        "requirements": "Biết HTML, CSS, JavaScript; đã làm ít nhất một bài tập hoặc dự án cá nhân.",
        "type": Job.InternshipType.HYBRID,
        "months": 3,
        "salary": (3_500_000, 5_500_000),
        "experience": Job.ExperienceLevel.NO_EXPERIENCE,
        "year": Job.AcademicYear.YEAR_2,
        "positions": 2,
        "days": 30,
    },
    {
        "key": "qa-manual",
        "company": "Demo Labs",
        "email": "demo-labs@internhub.local",
        "industry": ("Công nghệ thông tin", "cong-nghe-thong-tin"),
        "title": "QA / Manual Tester Intern",
        "category": ("Tester / QC Intern", "tester-qc-intern"),
        "location": ("Đà Nẵng", "da-nang"),
        "description": "TIN DEMO - Viết test case, kiểm thử luồng sản phẩm và phối hợp với developer để tái hiện lỗi.",
        "requirements": "Tư duy logic, cẩn thận; biết ghi bug rõ ràng; ưu tiên đã dùng Postman.",
        "type": Job.InternshipType.FULL_TIME,
        "months": 4,
        "salary": (3_000_000, 4_500_000),
        "experience": Job.ExperienceLevel.NO_EXPERIENCE,
        "year": Job.AcademicYear.YEAR_3,
        "positions": 1,
        "days": 25,
    },
    {
        "key": "data-analyst",
        "company": "Demo Insights",
        "email": "demo-insights@internhub.local",
        "industry": ("Dữ liệu và phân tích", "du-lieu-va-phan-tich"),
        "title": "Data Analyst Intern",
        "category": ("Data Analyst", "data-analyst"),
        "location": ("TP. Hồ Chí Minh", "tp-ho-chi-minh"),
        "description": "TIN DEMO - Làm sạch dữ liệu, tạo báo cáo và trình bày insight hỗ trợ nhóm vận hành ra quyết định.",
        "requirements": "Biết Excel/Google Sheets; SQL cơ bản; có thể giải thích kết luận từ dữ liệu.",
        "type": Job.InternshipType.HYBRID,
        "months": 3,
        "salary": (4_000_000, 6_000_000),
        "experience": Job.ExperienceLevel.NO_EXPERIENCE,
        "year": Job.AcademicYear.YEAR_3,
        "positions": 1,
        "days": 32,
    },
    {
        "key": "marketing-content",
        "company": "Demo Creative",
        "email": "demo-creative@internhub.local",
        "industry": ("Truyền thông và quảng cáo", "truyen-thong-va-quang-cao"),
        "title": "Content Marketing Intern",
        "category": ("Marketing Intern", "marketing-intern"),
        "location": ("TP. Hồ Chí Minh", "tp-ho-chi-minh"),
        "description": "TIN DEMO - Lên ý tưởng nội dung social, hỗ trợ lịch đăng và theo dõi hiệu quả chiến dịch.",
        "requirements": "Viết tiếng Việt tốt; quan tâm đến mạng xã hội; có thể gửi một vài nội dung đã viết.",
        "type": Job.InternshipType.PART_TIME,
        "months": 3,
        "salary": (2_500_000, 4_000_000),
        "experience": Job.ExperienceLevel.NO_EXPERIENCE,
        "year": Job.AcademicYear.YEAR_2,
        "positions": 2,
        "days": 20,
    },
    {
        "key": "uiux-design",
        "company": "Demo Creative",
        "email": "demo-creative@internhub.local",
        "industry": ("Truyền thông và quảng cáo", "truyen-thong-va-quang-cao"),
        "title": "UI/UX Design Intern",
        "category": ("UI/UX Design", "ui-ux-design"),
        "location": ("Hà Nội", "ha-noi"),
        "description": "TIN DEMO - Hỗ trợ nghiên cứu trải nghiệm, dựng wireframe và hoàn thiện prototype cùng product team.",
        "requirements": "Biết Figma; có tư duy lấy người dùng làm trung tâm; portfolio là lợi thế.",
        "type": Job.InternshipType.HYBRID,
        "months": 3,
        "salary": (3_000_000, 5_000_000),
        "experience": Job.ExperienceLevel.NO_EXPERIENCE,
        "year": Job.AcademicYear.YEAR_2,
        "positions": 1,
        "days": 26,
    },
    {
        "key": "business-development",
        "company": "Demo Connect",
        "email": "demo-connect@internhub.local",
        "industry": ("Thương mại điện tử", "thuong-mai-dien-tu"),
        "title": "Business Development Intern",
        "category": ("Business Development", "business-development"),
        "location": ("TP. Hồ Chí Minh", "tp-ho-chi-minh"),
        "description": "TIN DEMO - Nghiên cứu đối tác, chuẩn bị tài liệu giới thiệu và hỗ trợ theo dõi cơ hội hợp tác.",
        "requirements": "Giao tiếp tốt; chủ động; biết sử dụng bảng tính và trình bày ngắn gọn.",
        "type": Job.InternshipType.FULL_TIME,
        "months": 3,
        "salary": (3_500_000, 5_000_000),
        "experience": Job.ExperienceLevel.NO_EXPERIENCE,
        "year": Job.AcademicYear.YEAR_3,
        "positions": 2,
        "days": 24,
    },
    {
        "key": "hr-recruitment",
        "company": "Demo Connect",
        "email": "demo-connect@internhub.local",
        "industry": ("Thương mại điện tử", "thuong-mai-dien-tu"),
        "title": "Talent Acquisition Intern",
        "category": ("Human Resources", "human-resources"),
        "location": ("Hải Phòng", "hai-phong"),
        "description": "TIN DEMO - Hỗ trợ đăng tuyển, sắp xếp lịch phỏng vấn và cải thiện trải nghiệm ứng viên.",
        "requirements": "Cẩn thận, giao tiếp lịch sự; yêu thích công việc kết nối con người.",
        "type": Job.InternshipType.PART_TIME,
        "months": 3,
        "salary": (2_500_000, 3_500_000),
        "experience": Job.ExperienceLevel.NO_EXPERIENCE,
        "year": Job.AcademicYear.YEAR_2,
        "positions": 1,
        "days": 29,
    },
]


class Command(BaseCommand):
    help = "Tạo các tin tuyển dụng DEMO để xem giao diện trong môi trường phát triển."

    def add_arguments(self, parser):
        parser.add_argument(
            "--allow-remote",
            action="store_true",
            help="Cho phép seed vào database remote. Chỉ dùng khi bạn chủ động muốn dữ liệu demo trên DB đó.",
        )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Từ chối tạo dữ liệu demo khi DEBUG=False.")

        database = settings.DATABASES["default"]
        host = database.get("HOST", "")
        is_local = host in ("", "localhost", "127.0.0.1", "::1")
        if not is_local and not options["allow_remote"]:
            raise CommandError(
                "Database hiện là remote. Lệnh mặc định không ghi dữ liệu demo lên đó. "
                "Hãy chuyển sang MySQL Laragon hoặc truyền --allow-remote nếu chủ động xác nhận."
            )

        created = 0
        existing = 0
        with transaction.atomic():
            for item in DEMO_JOBS:
                industry_name, industry_slug = item["industry"]
                industry, _ = Industry.objects.get_or_create(
                    slug=industry_slug,
                    defaults={"name": industry_name},
                )
                category_name, category_slug = item["category"]
                category, _ = JobCategory.objects.get_or_create(
                    slug=category_slug,
                    defaults={"name": category_name},
                )
                location_name, location_slug = item["location"]
                location, _ = Location.objects.get_or_create(
                    slug=location_slug,
                    defaults={"name": location_name},
                )

                user_model = get_user_model()
                email = item["email"]
                employer_user, user_created = user_model.objects.get_or_create(
                    email=email,
                    defaults={
                        "username": email,
                        "first_name": item["company"],
                        "role": user_model.Role.EMPLOYER,
                    },
                )
                if employer_user.role != user_model.Role.EMPLOYER:
                    raise CommandError(f"Tài khoản demo {email} đã tồn tại nhưng không phải employer.")
                if user_created:
                    employer_user.set_unusable_password()
                    employer_user.save(update_fields=["password"])

                employer, _ = EmployerProfile.objects.get_or_create(
                    user=employer_user,
                    defaults={
                        "company_name": item["company"],
                        "industry": industry,
                        "description": "Hồ sơ doanh nghiệp mẫu chỉ phục vụ xem thử giao diện InternHub.",
                        "address": location_name,
                    },
                )
                defaults = {
                    "employer": employer,
                    "title": f"DEMO · {item['title']}",
                    "description": item["description"],
                    "requirements": item["requirements"],
                    "job_category": category,
                    "location": location,
                    "internship_type": item["type"],
                    "duration_months": item["months"],
                    "salary_min": item["salary"][0],
                    "salary_max": item["salary"][1],
                    "experience_level": item["experience"],
                    "min_academic_year": item["year"],
                    "num_positions": item["positions"],
                    "deadline": timezone.localdate() + timedelta(days=item["days"]),
                    "status": Job.Status.APPROVED,
                }
                _, job_created = Job.objects.get_or_create(
                    slug=f"demo-{item['key']}",
                    defaults=defaults,
                )
                if job_created:
                    created += 1
                else:
                    existing += 1

        self.stdout.write(self.style.SUCCESS(
            f"Demo jobs ready: {created} new, {existing} already existed."
        ))
        self.stdout.write("All sample listings are marked DEMO in their title and description.")