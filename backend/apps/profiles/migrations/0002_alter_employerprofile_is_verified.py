from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("profiles", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="employerprofile",
            name="is_verified",
            field=models.BooleanField(db_default=False, default=False),
        ),
    ]