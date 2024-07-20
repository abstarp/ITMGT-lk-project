from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=True, help_text='Required')
    last_name = forms.CharField(max_length=30, required=True, help_text='Required')
    birthday = forms.DateField(
        required=True,
        widget=forms.DateInput(attrs={'type': 'date'}),
        help_text='Required'
    )
    mobile_number = forms.CharField(max_length=15, required=True, help_text='Required')
    email = forms.EmailField(required=True, help_text='Required')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'birthday', 'mobile_number', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            user_profile = UserProfile(
                user=user,
                first_name=self.cleaned_data['first_name'],
                last_name=self.cleaned_data['last_name'],
                birthday=self.cleaned_data['birthday'],
                mobile_number=self.cleaned_data['mobile_number'],
                email=self.cleaned_data['email']
            )
            user_profile.save()
        return user
