from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    birthday = models.DateField()
    mobile_number = models.CharField(max_length=15)
    email = models.EmailField()

    def __str__(self):
        return self.user.username


class Table(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    seats = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.seats} seats)"

class PreReservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.CharField(max_length=10)
    pax = models.IntegerField()

    def __str__(self):
        return f"Pre-reserved by {self.user.username} on {self.date} at {self.time} for {self.pax} pax"

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.CharField(max_length=10)
    pax = models.IntegerField()
    tables = models.ManyToManyField(Table)

    @property
    def total_amount(self):
        return sum(table.price for table in self.tables.all())

    def __str__(self):
        return f"Reserved by {self.user.username} on {self.date} at {self.time} for {self.pax} pax"
