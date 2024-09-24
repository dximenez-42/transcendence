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
class Tournament(models.Model):
    TOURNAMENT_STATUS_CHOICES = [
        ('open', 'Open'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=TOURNAMENT_STATUS_CHOICES, default='open')
    max_players = models.IntegerField()
    room_id = models.CharField(max_length=255)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tournaments'

    def __str__(self):
        return self.name


class Game(models.Model):
    GAME_STATUS_CHOICES = [
        ('open', 'Open'),
        ('preparing', 'Preparing'),
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
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'game_players'

    def __str__(self):
        return self.name


class TournamentPlayer(models.Model):
    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    eliminated = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tournament_players'
