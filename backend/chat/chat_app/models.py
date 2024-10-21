from django.db import models

# Create your models here.
class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    token = models.CharField(max_length=255, null=True, blank=True)    
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'  # This specifies the exact table name

    def __str__(self):
        return self.username

class UserBlocked(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_id')
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_id')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_blocked'  # This specifies the exact table name

    def __str__(self):
        return self.user.username + ' blocked ' + self.blocked.username

class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)

    room_id = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chats'  # This specifies the exact table name

    def __str__(self):
        return self.name
    
class UsersChat(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)

    class Meta:
        db_table = 'users_chats'  # This specifies the exact table name

    def __str__(self):
        return self.user.username + ' in ' + self.chat.name
    
class Message(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender_id')
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    content = models.TextField()
    content_type = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'messages'

    def __str__(self):
        return self.sender.username + ' in ' + self.chat.name + ': ' + self.content