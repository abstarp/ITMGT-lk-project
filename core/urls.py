from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('home/', views.home, name='home'),
    path('logout/', views.logout_view, name='logout'),
    path('about/', views.about, name='about'),
    path('menu/', views.menu, name='menu'),
    path('reservation/', views.reservation, name='reservation'),
    path('save_reservation/', views.save_reservation, name='save_reservation'),
    path('myreserve/', views.my_reserve_view, name='myreserve'),
    path('api/get_user_id/', views.get_user_id, name='get_user_id'),
    path('choose_table/<int:pre_reservation_id>/', views.choose_table, name='choose_table'),
    path('api/pre_reservations/<str:date>/', views.fetch_pre_reservation_data, name='fetch_pre_reservation_data'),
    path('api/reservations/<str:date>/', views.fetch_pre_reservations_for_date, name='fetch_pre_reservations_for_date'),
    path('api/tables/', views.get_tables, name='get_tables'),
    path('api/confirm_reservation/', views.confirm_reservation, name='confirm_reservation'),
    path('api/create_pre_reservation/', views.create_pre_reservation, name='create_pre_reservation'),
    path('api/cancel_pre_reservation/<int:pre_reservation_id>/', views.cancel_pre_reservation, name='cancel_pre_reservation'),
]