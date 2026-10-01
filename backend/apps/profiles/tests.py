from datetime import date, timedelta
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Industry
from apps.jobs.models import Job
from .models import EmployerProfile
from .models import StudentProfile


class EmployerProfileMeTests(APITestCase):
	def tearDown(self):
		if self.profile.logo:
			self.profile.logo.delete(save=False)

	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="employer@example.com",
			email="employer@example.com",
			password="StrongPass123!",
			role="employer",
			first_name="Mai Nguyen",
			phone="0900000000",
		)
		self.profile = EmployerProfile.objects.create(
			user=self.user,
			company_name="InternHub Demo",
		)
		self.industry = Industry.objects.create(name="Công nghệ thông tin", slug="cong-nghe-thong-tin")
		self.client.force_authenticate(self.user)

	def test_employer_can_update_contact_and_company_profile(self):
		response = self.client.patch("/api/v1/profiles/employer/me/", {
			"full_name": "Mai Nguyen Updated",
			"email": "mai.updated@example.com",
			"phone": "0911111111",
			"company_name": "InternHub Studio",
			"industry": self.industry.pk,
			"website": "https://internhub.example",
		}, format="json")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.user.refresh_from_db()
		self.profile.refresh_from_db()
		self.assertEqual(self.user.first_name, "Mai Nguyen Updated")
		self.assertEqual(self.user.email, "mai.updated@example.com")
		self.assertEqual(self.profile.company_name, "InternHub Studio")
		self.assertEqual(self.profile.industry, self.industry)
		self.assertFalse(self.profile.is_verified)

	def test_employer_cannot_mark_own_profile_verified(self):
		response = self.client.patch(
			"/api/v1/profiles/employer/me/",
			{"is_verified": True},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.profile.refresh_from_db()
		self.assertFalse(self.profile.is_verified)

	def test_student_cannot_read_employer_profile(self):
		student = get_user_model().objects.create_user(
			username="student@example.com",
			email="student@example.com",
			password="StrongPass123!",
			role="student",
		)
		self.client.force_authenticate(student)

		response = self.client.get("/api/v1/profiles/employer/me/")

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_employer_can_upload_and_remove_company_logo(self):
		image_buffer = BytesIO()
		Image.new("RGB", (16, 16), color="blue").save(image_buffer, format="PNG")
		logo = SimpleUploadedFile("company-logo.png", image_buffer.getvalue(), content_type="image/png")

		upload_response = self.client.patch(
			"/api/v1/profiles/employer/me/",
			{"logo": logo, "company_name": "InternHub Studio"},
			format="multipart",
		)

		self.assertEqual(upload_response.status_code, status.HTTP_200_OK)
		self.assertTrue(upload_response.data["logo"].endswith(".png"))
		self.profile.refresh_from_db()
		logo_name = self.profile.logo.name

		remove_response = self.client.patch(
			"/api/v1/profiles/employer/me/",
			{"remove_logo": True},
			format="json",
		)

		self.assertEqual(remove_response.status_code, status.HTTP_200_OK)
		self.profile.refresh_from_db()
		self.assertFalse(self.profile.logo)
		self.assertFalse(self.profile.logo.storage.exists(logo_name))


class StudentCvUploadTests(APITestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="cv-student@example.com",
			email="cv-student@example.com",
			password="StrongPass123!",
			role="student",
		)
		self.profile = StudentProfile.objects.create(user=self.user, full_name="CV Student")
		self.client.force_authenticate(self.user)

	def tearDown(self):
		if self.profile.cv_file:
			self.profile.cv_file.delete(save=False)

	def test_student_can_upload_and_remove_cv(self):
		cv = SimpleUploadedFile("resume.pdf", b"sample pdf", content_type="application/pdf")
		upload_response = self.client.patch(
			"/api/v1/profiles/student/me/",
			{"cv_file": cv},
			format="multipart",
		)

		self.assertEqual(upload_response.status_code, status.HTTP_200_OK)
		self.assertTrue(upload_response.data["cv_file"].endswith(".pdf"))
		self.profile.refresh_from_db()
		cv_name = self.profile.cv_file.name

		remove_response = self.client.patch(
			"/api/v1/profiles/student/me/",
			{"cv_file": None},
			format="json",
		)

		self.assertEqual(remove_response.status_code, status.HTTP_200_OK)
		self.profile.refresh_from_db()
		self.assertFalse(self.profile.cv_file)
		self.assertFalse(self.profile.cv_file.storage.exists(cv_name))

class PublicCompanyProfileTests(APITestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="company@example.com",
			email="private@example.com",
			password="StrongPass123!",
			role="employer",
			phone="0901234567",
		)
		self.industry = Industry.objects.create(name="Công nghệ", slug="cong-nghe")
		self.company = EmployerProfile.objects.create(
			user=self.user,
			company_name="Công ty Demo",
			industry=self.industry,
			company_size="51-200",
			tax_code="TAX-PRIVATE",
			address="Hà Nội",
			description="Giới thiệu doanh nghiệp.",
		)

	def create_job(self, title, status):
		return Job.objects.create(
			employer=self.company,
			title=title,
			slug=f"{title.lower().replace(' ', '-')}-{Job.objects.count()}",
			description="Mô tả vị trí.",
			deadline=date.today() + timedelta(days=30),
			status=status,
		)

	def test_public_company_page_only_exposes_public_fields_and_counts_approved_jobs(self):
		self.create_job("Tin đang tuyển", Job.Status.APPROVED)
		self.create_job("Tin chờ duyệt", Job.Status.PENDING)

		response = self.client.get(f"/api/v1/profiles/companies/{self.company.pk}/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["company_name"], "Công ty Demo")
		self.assertEqual(response.data["industry"]["name"], "Công nghệ")
		self.assertEqual(response.data["public_jobs_count"], 1)
		self.assertNotIn("email", response.data)
		self.assertNotIn("phone", response.data)
		self.assertNotIn("tax_code", response.data)

	def test_public_job_list_can_filter_by_company_and_hides_unapproved_jobs(self):
		approved = self.create_job("Tin đang tuyển", Job.Status.APPROVED)
		self.create_job("Tin chờ duyệt", Job.Status.PENDING)

		response = self.client.get("/api/v1/jobs/", {"employer": self.company.pk})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["count"], 1)
		self.assertEqual(response.data["results"][0]["id"], approved.pk)
