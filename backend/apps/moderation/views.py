from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.jobs.models import Job
from .models import Report

UserModel = get_user_model()


class ReportCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_type = request.data.get("target_type")
        target_id = request.data.get("target_id")
        reason = str(request.data.get("reason", "")).strip()
        description = str(request.data.get("description", "")).strip()
        if target_type not in (Report.TargetType.JOB, Report.TargetType.USER):
            return Response({"target_type": "Loại đối tượng không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)
        if not str(target_id or "").isdigit():
            return Response({"target_id": "Vui lòng chọn đối tượng cần báo cáo."}, status=status.HTTP_400_BAD_REQUEST)
        if not reason or len(reason) > 255:
            return Response({"reason": "Lý do là bắt buộc và tối đa 255 ký tự."}, status=status.HTTP_400_BAD_REQUEST)
        if target_type == Report.TargetType.JOB:
            get_object_or_404(Job, pk=target_id)
        elif not UserModel.objects.filter(pk=target_id).exists():
            return Response({"target_id": "Không tìm thấy người dùng."}, status=status.HTTP_404_NOT_FOUND)
        report, created = Report.objects.get_or_create(
            reporter=request.user,
            target_type=target_type,
            target_id=target_id,
            status=Report.Status.PENDING,
            defaults={"reason": reason, "description": description},
        )
        return Response(
            {"id": report.pk, "status": report.status, "message": "Đã gửi báo cáo." if created else "Báo cáo đang chờ xử lý đã tồn tại."},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
# Create your views here.
