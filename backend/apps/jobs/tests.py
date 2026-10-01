from django.contrib.auth import get_user_model
from datetime import date, timedelta
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import JobCategory, Location
from apps.profiles.models import EmployerProfile, StudentProfile
from apps.applications.models import Application, ApplicationStatusLog
from .models import Job


class EmployerJobCreateTests(APITestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="employer@example.com",
			email="employer@example.com",
			password="StrongPass123!",
			role="employer",
			first_name="Demo Company",
		)
		self.profile = EmployerProfile.objects.create(user=self.user, company_name="Demo Company")
		self.category = JobCategory.objects.create(name="Backend Developer", slug="backend-developer")
		self.location = Location.objects.create(name="Hà Nội", slug="ha-noi")
		self.client.force_authenticate(self.user)

	def create_job(self, employer=None, job_status=Job.Status.PENDING):
		return Job.objects.create(
			employer=employer or self.profile,
			title="Backend Intern",
			slug=f"backend-intern-{Job.objects.count()}",
			description="Tham gia phát triển API.",
			deadline=date.today() + timedelta(days=30),
			status=job_status,
		)

	def test_employer_can_create_pending_job_and_remains_unverified(self):
		response = self.client.post("/api/v1/jobs/manage/", {
			"title": "Backend Intern",
			"description": "Tham gia phát triển API.",
			"requirements": "Biết Python cơ bản.",
			"job_category": self.category.pk,
			"location": self.location.pk,
			"deadline": "2027-01-31",
			"num_positions": 2,
		}, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		job = Job.objects.get()
		self.profile.refresh_from_db()
		self.assertEqual(job.employer, self.profile)
		self.assertEqual(job.status, Job.Status.PENDING)
		self.assertFalse(self.profile.is_verified)
		self.assertEqual(response.data["application_count"], 0)

	def test_non_employer_cannot_create_job(self):
		student = get_user_model().objects.create_user(
			username="student@example.com",
			email="student@example.com",
			password="StrongPass123!",
			role="student",
		)
		self.client.force_authenticate(student)

		response = self.client.post("/api/v1/jobs/manage/", {
			"title": "Backend Intern",
			"description": "Tham gia phát triển API.",
			"deadline": "2027-01-31",
		}, format="json")

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_employer_can_edit_own_job(self):
		job = self.create_job()
		self.create_application(job)

		response = self.client.patch(
			f"/api/v1/jobs/manage/{job.pk}/",
			{"title": "Python Backend Intern"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["application_count"], 1)
		self.assertEqual(response.data["pending_application_count"], 1)
		job.refresh_from_db()
		self.assertEqual(job.title, "Python Backend Intern")
		self.assertEqual(job.status, Job.Status.PENDING)

	def test_editing_approved_job_requires_moderation_again(self):
		job = self.create_job(job_status=Job.Status.APPROVED)

		response = self.client.patch(
			f"/api/v1/jobs/manage/{job.pk}/",
			{"description": "Mô tả đã cập nhật."},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		job.refresh_from_db()
		self.assertEqual(job.status, Job.Status.PENDING)

	def test_employer_cannot_edit_another_employers_job(self):
		other_user = get_user_model().objects.create_user(
			username="other@example.com",
			email="other@example.com",
			password="StrongPass123!",
			role="employer",
		)
		other_profile = EmployerProfile.objects.create(user=other_user, company_name="Other Company")
		job = self.create_job(employer=other_profile)

		response = self.client.patch(
			f"/api/v1/jobs/manage/{job.pk}/",
			{"title": "Changed title"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

	def test_employer_can_close_own_job(self):
		job = self.create_job()

		response = self.client.post(f"/api/v1/jobs/manage/{job.pk}/close/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		job.refresh_from_db()
		self.assertEqual(job.status, Job.Status.CLOSED)

	def test_employer_can_view_applicant_details_for_own_job(self):
		job = self.create_job()
		student_user = get_user_model().objects.create_user(
			username="candidate@example.com",
			email="candidate@example.com",
			password="StrongPass123!",
			role="student",
			phone="0901234567",
		)
		student = StudentProfile.objects.create(
			user=student_user,
			full_name="Nguyễn An",
			university="Đại học Demo",
			major="Công nghệ thông tin",
		)
		self.application = Application.objects.create(
			student_profile=student,
			job=job,
			cv_snapshot=SimpleUploadedFile("candidate.pdf", b"test pdf"),
			cover_letter="Em muốn ứng tuyển vị trí này.",
		)

		response = self.client.get(f"/api/v1/jobs/manage/{job.pk}/applications/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["count"], 1)
		applicant = response.data["results"][0]
		self.assertEqual(applicant["email"], "candidate@example.com")
		self.assertEqual(applicant["phone"], "0901234567")
		self.assertIn("/cv_snapshots/", applicant["cv_url"])
		self.assertIn("candidate", applicant["cv_url"])
		jobs_response = self.client.get("/api/v1/jobs/manage/")
		self.assertEqual(jobs_response.data["results"][0]["application_count"], 1)
		self.assertEqual(jobs_response.data["results"][0]["pending_application_count"], 1)

	def test_employer_can_update_applicant_status_and_status_log(self):
		job = self.create_job()
		self.create_application(job)

		response = self.client.patch(
			f"/api/v1/jobs/manage/{job.pk}/applications/{self.application.pk}/status/",
			{"status": Application.Status.SHORTLISTED, "note": "Phù hợp với yêu cầu."},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.application.refresh_from_db()
		self.assertEqual(self.application.status, Application.Status.SHORTLISTED)
		self.assertTrue(ApplicationStatusLog.objects.filter(
			application=self.application,
			status=Application.Status.SHORTLISTED,
			changed_by=self.user,
		).exists())
		jobs_response = self.client.get("/api/v1/jobs/manage/")
		self.assertEqual(jobs_response.data["results"][0]["pending_application_count"], 0)
		self.assertEqual(jobs_response.data["results"][0]["shortlisted_application_count"], 1)

	def test_employer_cannot_update_applicant_status_for_another_job(self):
		other_user = get_user_model().objects.create_user(
			username="other@example.com",
			email="other@example.com",
			password="StrongPass123!",
			role="employer",
		)
		other_profile = EmployerProfile.objects.create(user=other_user, company_name="Other Company")
		other_job = self.create_job(employer=other_profile)
		self.create_application(other_job)

		response = self.client.patch(
			f"/api/v1/jobs/manage/{other_job.pk}/applications/{self.application.pk}/status/",
			{"status": Application.Status.ACCEPTED},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

	def create_application(self, job):
		student_user = get_user_model().objects.create_user(
			username="candidate@example.com",
			email="candidate@example.com",
			password="StrongPass123!",
			role="student",
		)
		student = StudentProfile.objects.create(user=student_user, full_name="Nguyễn An")
		self.application = Application.objects.create(
			student_profile=student,
			job=job,
			cv_snapshot=SimpleUploadedFile("candidate.pdf", b"test pdf"),
		)

	def test_employer_cannot_view_another_employers_applicants(self):
		other_user = get_user_model().objects.create_user(
			username="other@example.com",
			email="other@example.com",
			password="StrongPass123!",
			role="employer",
		)
		other_profile = EmployerProfile.objects.create(user=other_user, company_name="Other Company")
		job = self.create_job(employer=other_profile)

		response = self.client.get(f"/api/v1/jobs/manage/{job.pk}/applications/")

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class JobSalaryInsightsTests(APITestCase):
	def setUp(self):
		user = get_user_model().objects.create_user(
			username="salary-company@example.com",
			email="salary-company@example.com",
			password="StrongPass123!",
			role="employer",
		)
		self.employer = EmployerProfile.objects.create(user=user, company_name="Salary Company")
		self.category = JobCategory.objects.create(name="Data Analyst", slug="data-analyst")
		self.location = Location.objects.create(name="Ha Noi", slug="ha-noi")

	def create_job(self, title, salary_min, salary_max, job_status, is_negotiable=False):
		return Job.objects.create(
			employer=self.employer,
			title=title,
			slug=f"{title.lower().replace(' ', '-')}-{Job.objects.count()}",
			description="Test salary insights",
			job_category=self.category,
			location=self.location,
			salary_min=salary_min,
			salary_max=salary_max,
			is_salary_negotiable=is_negotiable,
			deadline=date.today() + timedelta(days=30),
			status=job_status,
		)

	def test_insights_only_use_approved_public_salary_listings(self):
		self.create_job("Junior Analyst A", 8_000_000, 12_000_000, Job.Status.APPROVED)
		self.create_job("Junior Analyst B", 10_000_000, 14_000_000, Job.Status.APPROVED)
		self.create_job("Pending Analyst", 100_000_000, 120_000_000, Job.Status.PENDING)
		self.create_job("Negotiable Analyst", 1_000_000, 2_000_000, Job.Status.APPROVED, is_negotiable=True)

		response = self.client.get("/api/v1/jobs/salary-insights/", {
			"category": self.category.pk,
			"location": self.location.pk,
		})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["count"], 2)
		self.assertEqual(response.data["salary_min"], 8_000_000)
		self.assertEqual(response.data["salary_median"], 11_000_000)
		self.assertEqual(response.data["salary_max"], 14_000_000)


class JobMarketInsightsTests(APITestCase):
	def setUp(self):
		user = get_user_model().objects.create_user(
			username="market-company@example.com",
			email="market-company@example.com",
			password="StrongPass123!",
			role="employer",
		)
		self.employer = EmployerProfile.objects.create(user=user, company_name="Market Company")
		self.category = JobCategory.objects.create(name="Backend", slug="backend")
		self.location = Location.objects.create(name="Ha Noi", slug="ha-noi")

	def create_job(self, title, job_status, salary_min=8_000_000, salary_max=12_000_000):
		return Job.objects.create(
			employer=self.employer,
			title=title,
			slug=f"{title.lower().replace(' ', '-')}-{Job.objects.count()}",
			description="Market insight test",
			job_category=self.category,
			location=self.location,
			salary_min=salary_min,
			salary_max=salary_max,
			num_positions=2,
			deadline=date.today() + timedelta(days=30),
			status=job_status,
		)

	def test_market_insights_are_aggregated_only_from_approved_jobs(self):
		self.create_job("Approved listing", Job.Status.APPROVED)
		self.create_job("Pending listing", Job.Status.PENDING, 90_000_000, 100_000_000)

		response = self.client.get("/api/v1/jobs/market-insights/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["total_jobs"], 1)
		self.assertEqual(response.data["total_openings"], 2)
		self.assertEqual(response.data["top_categories"][0]["name"], "Backend")
		self.assertEqual(response.data["salary"]["salary_max"], 12_000_000)

