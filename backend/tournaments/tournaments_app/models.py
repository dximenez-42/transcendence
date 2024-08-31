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


class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tournaments'

    def __str__(self):
        return self.name


class Game(models.Model):
    GAME_STATUS_CHOICES = [
        ('open', 'Open'),
        ('ready', 'Ready'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
    ]


    id = models.AutoField(primary_key=True)
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=GAME_STATUS_CHOICES, default='open')
    room_id = models.CharField(max_length=255)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'games'

    def __str__(self):
        return self.name


class GamePlayer(models.Model):
    id = models.AutoField(primary_key=True)
    game= models.ForeignKey(Game, on_delete=models.CASCADE)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'game_players'

    def __str__(self):
        return self.name
