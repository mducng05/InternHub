from datetime import date, timedelta

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.jobs.models import Job
from apps.profiles.models import EmployerProfile


class DemoJobApplicationTests(APITestCase):
	def test_demo_job_rejects_application_submission(self):
		employer_user = get_user_model().objects.create_user(
			username="demo-company@internhub.local",
			email="demo-company@internhub.local",
			password="StrongPass123!",
			role="employer",
		)
		employer = EmployerProfile.objects.create(user=employer_user, company_name="Demo Company")
		job = Job.objects.create(
			employer=employer,
			title="DEMO · Backend Intern",
			slug="demo-test-application-block",
			description="Sample listing",
			deadline=date.today() + timedelta(days=30),
			status=Job.Status.APPROVED,
		)

		response = self.client.post("/api/v1/applications/", {"job_id": job.pk}, format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("minh họa", response.data["detail"])
