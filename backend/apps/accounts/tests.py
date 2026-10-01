from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.storage import default_storage
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from apps.profiles.models import EmployerProfile


class EmployerRegistrationTests(APITestCase):
	def test_new_employer_profile_starts_unverified(self):
		response = self.client.post("/api/v1/auth/register/", {
			"full_name": "Công ty Demo",
			"email": "company@example.com",
			"role": "employer",
			"password": "StrongPass123!",
			"password_confirm": "StrongPass123!",
		}, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		user = get_user_model().objects.get(email="company@example.com")
		profile = EmployerProfile.objects.get(user=user)
		self.assertFalse(user.is_verified)
		self.assertFalse(profile.is_verified)


class AccountAvatarTests(APITestCase):
	def tearDown(self):
		for user in get_user_model().objects.all():
			if user.avatar:
				user.avatar.delete(save=False)

	def test_all_roles_can_upload_and_remove_account_avatar(self):
		user_model = get_user_model()
		for role in user_model.Role.values:
			with self.subTest(role=role):
				user = user_model.objects.create_user(
					username=f"{role}@example.com",
					email=f"{role}@example.com",
					password="StrongPass123!",
					role=role,
				)
				self.client.force_authenticate(user)

				image_buffer = BytesIO()
				Image.new("RGB", (8, 8), color="red").save(image_buffer, format="PNG")
				image = SimpleUploadedFile(
					f"{role}.png",
					image_buffer.getvalue(),
					content_type="image/png",
				)
				upload_response = self.client.patch(
					"/api/v1/auth/me/",
					{"avatar": image},
					format="multipart",
				)

				self.assertEqual(upload_response.status_code, status.HTTP_200_OK)
				self.assertTrue(upload_response.data["avatar"].endswith(".png"))
				user.refresh_from_db()
				avatar_name = user.avatar.name

				self.client.force_authenticate(None)
				login_response = self.client.post("/api/v1/auth/token/", {
					"email": user.email,
					"password": "StrongPass123!",
				}, format="json")
				self.assertEqual(login_response.status_code, status.HTTP_200_OK)
				self.assertTrue(login_response.data["user"]["avatar"].endswith(".png"))

				self.client.force_authenticate(user)
				remove_response = self.client.patch(
					"/api/v1/auth/me/",
					{"avatar": None},
					format="json",
				)

				self.assertEqual(remove_response.status_code, status.HTTP_200_OK)
				user.refresh_from_db()
				self.assertFalse(user.avatar)
				default_storage.delete(avatar_name)
