from django.db import models

# Create your models here.
class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)

    class Meta:
        db_table = 'users'  # This specifies the exact table name

    def __str__(self):
        return self.username