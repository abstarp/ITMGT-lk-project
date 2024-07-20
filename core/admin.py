from django.contrib import admin
from .models import PreReservation, UserProfile, Reservation, Table

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'last_name', 'birthday', 'mobile_number', 'email')
    search_fields = ('user__username', 'first_name', 'last_name', 'email')

class ReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'time', 'pax')
    search_fields = ('user__username', 'date', 'time')

class PreReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'time', 'pax')
    search_fields = ('user__username', 'date', 'time')

admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Reservation, ReservationAdmin)
admin.site.register(PreReservation, PreReservationAdmin)
admin.site.register(Table)
