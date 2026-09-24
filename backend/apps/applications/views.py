from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.accounts.models import User
from apps.jobs.models import Job
from apps.profiles.models import StudentProfile
from .models import Application, ApplicationStatusLog


class ApplyJobView(generics.CreateAPIView):
    """
    API tiếp nhận hồ sơ ứng tuyển của ứng viên (có tải file CV).
    Hỗ trợ cả ứng viên đã đăng nhập và chưa đăng nhập.
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        job_id = request.data.get("job_id") or request.data.get("job")
        if not job_id:
            return Response(
                {"detail": "Thiếu thông tin việc làm (job_id)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        job = get_object_or_404(Job, pk=job_id)

        full_name = str(request.data.get("full_name", "")).strip()
        email = str(request.data.get("email", "")).strip().lower()
        phone = str(request.data.get("phone", "")).strip()
        cv_file = request.FILES.get("cv") or request.FILES.get("cv_snapshot")

        # 1. Kiểm tra các trường thông tin bắt buộc
        if not full_name:
            return Response(
                {"detail": "Vui lòng nhập họ và tên."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not email:
            return Response(
                {"detail": "Vui lòng nhập địa chỉ email liên hệ."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not phone:
            return Response(
                {"detail": "Vui lòng nhập số điện thoại liên hệ."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not cv_file:
            return Response(
                {"detail": "Vui lòng tải lên file CV của bạn."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Kiểm tra định dạng CV (.doc, .docx, .pdf)
        allowed_extensions = (".pdf", ".doc", ".docx")
        filename_lower = cv_file.name.lower()
        if not any(filename_lower.endswith(ext) for ext in allowed_extensions):
            return Response(
                {
                    "detail": "Định dạng CV không hợp lệ. Vui lòng tải lên file có đuôi .doc, .docx hoặc .pdf."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Giới hạn kích thước file CV tối đa 10MB
        if cv_file.size > 10 * 1024 * 1024:
            return Response(
                {"detail": "Dung lượng file CV vượt quá 10MB. Vui lòng giảm dung lượng và thử lại."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Xác định hoặc tạo tài khoản Student
        user = None
        if request.user.is_authenticated:
            user = request.user
        else:
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create(
                    username=email,
                    email=email,
                    first_name=full_name,
                    role=User.Role.STUDENT,
                    is_verified=False,
                )
                user.set_unusable_password()
                user.save()

        # Cập nhật số điện thoại / tên nếu user chưa có
        need_user_save = False
        if phone and not user.phone:
            user.phone = phone
            need_user_save = True
        if full_name and not user.first_name:
            user.first_name = full_name
            need_user_save = True
        if need_user_save:
            user.save()

        # 4. Tìm hoặc tạo StudentProfile
        profile, _ = StudentProfile.objects.get_or_create(
            user=user,
            defaults={"full_name": full_name},
        )
        if not profile.full_name:
            profile.full_name = full_name
            profile.save(update_fields=["full_name"])

        # 5. Kiểm tra ứng viên đã ứng tuyển vào job này chưa
        if Application.objects.filter(student_profile=profile, job=job).exists():
            return Response(
                {
                    "detail": "Bạn đã nộp hồ sơ ứng tuyển vào vị trí này trước đó rồi. Vui lòng theo dõi phản hồi từ nhà tuyển dụng."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cover_letter = str(request.data.get("cover_letter", "")).strip()

        # 6. Tạo đơn ứng tuyển Application
        application = Application.objects.create(
            student_profile=profile,
            job=job,
            cv_snapshot=cv_file,
            cover_letter=cover_letter,
            status=Application.Status.PENDING,
        )

        # Ghi log lịch sử trạng thái
        ApplicationStatusLog.objects.create(
            application=application,
            status=Application.Status.PENDING,
            note="Ứng viên nộp hồ sơ thành công",
            changed_by=user if user.is_authenticated else None,
        )

        return Response(
            {
                "success": True,
                "message": "Ứng tuyển thành công! Hồ sơ của bạn đã được chuyển tới nhà tuyển dụng.",
                "application_id": application.id,
                "job_title": job.title,
                "applied_at": application.applied_at,
            },
            status=status.HTTP_201_CREATED,
        )


class CheckAppliedView(generics.GenericAPIView):
    """Kiểm tra xem người dùng hiện tại đã ứng tuyển vào job này chưa"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        applied = False
        try:
            profile = request.user.student_profile
            applied = Application.objects.filter(student_profile=profile, job=job).exists()
        except Exception:
            applied = False
        return Response({"applied": applied})


class MyApplicationsView(generics.ListAPIView):
    """Lấy danh sách các việc làm mà người dùng hiện tại đã nộp đơn ứng tuyển"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Lọc các đơn nộp theo tài khoản người dùng
        applications = (
            Application.objects.filter(student_profile__user=request.user)
            .select_related("job", "job__employer", "job__location", "job__job_category")
            .order_by("-applied_at")
        )

        results = []
        for app in applications:
            job = app.job
            company_logo = None
            if job.employer and job.employer.logo:
                company_logo = request.build_absolute_uri(job.employer.logo.url)
            
            cv_url = None
            if app.cv_snapshot:
                cv_url = request.build_absolute_uri(app.cv_snapshot.url)

            results.append({
                "id": app.id,
                "status": app.status,
                "status_display": app.get_status_display(),
                "applied_at": app.applied_at,
                "cover_letter": app.cover_letter,
                "cv_url": cv_url,
                "job": {
                    "id": job.id,
                    "title": job.title,
                    "slug": job.slug,
                    "company_name": job.employer.company_name if job.employer else "Doanh nghiệp tuyển dụng",
                    "company_logo": company_logo,
                    "location": job.location.name if job.location else "Toàn quốc",
                    "internship_type": job.internship_type,
                    "internship_type_display": job.get_internship_type_display(),
                    "salary_min": job.salary_min,
                    "salary_max": job.salary_max,
                }
            })

        return Response({
            "count": len(results),
            "results": results,
        })

