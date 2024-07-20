from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from .forms import UserProfileForm, AuthenticationForm
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import reverse
import json
from .models import Reservation, Table, PreReservation
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import datetime

def index(request):
    save_reservation_url = reverse('save_reservation')
    return render(request, 'core/index.html', {'save_reservation_url': save_reservation_url})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')  # Redirect to home page after login
    else:
        form = AuthenticationForm()
    return render(request, 'registration/login.html', {'form': form})

def signup_view(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = UserProfileForm()
    return render(request, 'core/signup_view.html', {'form': form})

def about(request):
    return render(request, 'core/about.html')

def menu(request):
    return render(request, 'core/menu.html')

@login_required
def reservation(request):
    return render(request, 'core/reservation.html')

@login_required
@require_POST
def save_reservation(request):
    try:
        # Parse JSON data from the request body
        data = json.loads(request.body)
        date_str = data.get('date')
        time_str = data.get('time')
        pax = data.get('pax')

        if not all([date_str, time_str, pax]):
            return JsonResponse({'status': 'failed', 'error': 'Missing required fields'}, status=400)

        # Convert date string to a datetime object
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse({'status': 'failed', 'error': 'Invalid date format'}, status=400)

        # Create and save reservation
        reservation = Reservation(user=request.user, date=date, time=time_str, pax=pax)
        reservation.save()

        # Log created reservation for debugging
        print(f"Reservation created: {reservation}")

        return JsonResponse({'status': 'success'})
    except json.JSONDecodeError:
        # Handle JSON parsing errors
        return JsonResponse({'status': 'failed', 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        # Log the error for debugging
        print(f"Error: {e}")
        return JsonResponse({'status': 'failed', 'error': str(e)}, status=500)

def choose_table(request, pre_reservation_id):
    pre_reservation = get_object_or_404(PreReservation, id=pre_reservation_id)
    return render(request, 'core/choose_table.html', {
        'pre_reservation_id': pre_reservation_id,
        'pre_reservation_date': pre_reservation.date,
    })

def logout_view(request):
    logout(request)
    return redirect('login')

def home(request):
    return render(request, 'core/home.html')

@login_required
def my_reserve_view(request):
    # Get the current date and time
    now = timezone.now()

    # Fetch upcoming reservations (i.e., reservations in the future)
    upcoming_reservations = Reservation.objects.filter(user=request.user, date__gte=now.date()).order_by('date', 'time')

    # Fetch past reservations (i.e., reservations in the past)
    past_reservations = Reservation.objects.filter(user=request.user, date__lt=now.date()).order_by('-date', '-time')

    context = {
        'upcoming_reservations': upcoming_reservations,
        'past_reservations': past_reservations,
    }

    return render(request, 'core/myreserve.html', context)

@login_required
def get_user_id(request):
    if request.method == "GET":
        try:
            return JsonResponse({'status': 'success', 'user_id': request.user.id})
        except Exception as e:
            return JsonResponse({'status': 'failed', 'error': str(e)}, status=500)
    return JsonResponse({'status': 'failed', 'error': 'Invalid request method'}, status=405)

@require_http_methods(["GET"])
def fetch_pre_reservation_data(request, date):
    try:
        # Adjust the query according to your model and logic
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
        pre_reservations = PreReservation.objects.filter(date=parsed_date)
        data = list(pre_reservations.values())  # Adjust the serialization as needed
        return JsonResponse({'status': 'success', 'pre_reservations': data})
    except Exception as e:
        return JsonResponse({'status': 'failed', 'error': str(e)}, status=500)

@login_required
def fetch_pre_reservations_for_date(request, date):
    if request.method == "GET":
        try:
            parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
            pre_reservations = PreReservation.objects.filter(date=parsed_date)
            pre_reservation_list = list(pre_reservations.values('id', 'date', 'time', 'pax'))
            return JsonResponse({'status': 'success', 'pre_reservations': pre_reservation_list})
        except Exception as e:
            return JsonResponse({'status': 'failed', 'error': str(e)}, status=500)
    return JsonResponse({'status': 'failed', 'error': 'Invalid request method'}, status=405)

@login_required
def get_tables(request):
    if request.method == "GET":
        try:
            tables = Table.objects.all().values('id', 'name', 'price', 'seats')
            return JsonResponse(list(tables), safe=False)
        except Exception as e:
            return JsonResponse({'status': 'failed', 'error': str(e)}, status=500)
    return JsonResponse({'status': 'failed', 'error': 'Invalid request method'}, status=405)

@csrf_exempt
@login_required
def confirm_reservation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tables = data.get('tables')
            pre_reservation = data.get('pre_reservation')

            if not tables or not pre_reservation:
                return JsonResponse({'status': 'failed', 'error': 'Missing data'}, status=400)

            # Validate tables
            valid_tables = Table.objects.filter(id__in=tables)
            if len(valid_tables) != len(tables):
                return JsonResponse({'status': 'failed', 'error': 'One or more tables are invalid'}, status=400)

            # Check if tables are already reserved for the same date and time
            reservation_date_str = pre_reservation.get('date')
            reservation_time = pre_reservation.get('time')
            reservation_date = datetime.strptime(reservation_date_str, "%Y-%m-%d").date()
            existing_reservations = Reservation.objects.filter(
                date=reservation_date,
                time=reservation_time,
                tables__in=valid_tables
            )

            if existing_reservations.exists():
                return JsonResponse({'status': 'failed', 'error': 'One or more tables are already booked for the selected date and time.'}, status=400)

            # Create new reservation
            reservation_obj = Reservation.objects.create(
                user_id=pre_reservation.get('user_id'),
                date=reservation_date,
                time=reservation_time,
                pax=pre_reservation.get('pax')
            )
            reservation_obj.tables.set(valid_tables)

            # Optionally, delete the pre-reservation after successful reservation
            PreReservation.objects.filter(id=pre_reservation.get('id')).delete()

            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'failed', 'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'failed', 'error': str(e)}, status=500)
    return JsonResponse({'status': 'failed', 'error': 'Invalid request method'}, status=405)

@csrf_exempt
@login_required
def create_pre_reservation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            date_str = data.get('date')
            time_str = data.get('time')
            pax = data.get('pax')

            # Validate the input data
            if not date_str or not time_str or not pax:
                return JsonResponse({'status': 'error', 'error': 'Invalid input data'}, status=400)

            # Convert date string to a datetime object
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse({'status': 'error', 'error': 'Invalid date format'}, status=400)

            # Save the pre-reservation to the PreReservation model
            pre_reservation = PreReservation.objects.create(
                user=request.user,
                date=date,
                time=time_str,
                pax=pax
            )

            return JsonResponse({'status': 'success', 'pre_reservation_id': pre_reservation.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'error': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'error': 'Invalid request method'}, status=405)

@login_required
@require_http_methods(["DELETE"])
def cancel_pre_reservation(request, pre_reservation_id):
    try:
        pre_reservation = PreReservation.objects.get(id=pre_reservation_id, user=request.user)
        pre_reservation.delete()
        return JsonResponse({'status': 'success'})
    except PreReservation.DoesNotExist:
        return JsonResponse({'status': 'failed', 'error': 'Pre-reservation not found or does not belong to the user'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'failed', 'error': str(e)}, status=500)
