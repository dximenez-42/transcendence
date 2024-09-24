from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

@login_required
def waiting_room(request):
    users = User.objects.filter(is_active=True).exclude(username=request.user.username)
    return render(request, 'chat/waiting_room.html', {'users': users})


@login_required
def lobby(request):
    return render(request, 'chat/lobby.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})

@login_required
def start_chat(request, username):
    user_to_chat = get_object_or_404(User, username=username)
    return render(request, 'chat/lobby.html', {'user_to_chat': user_to_chat})
