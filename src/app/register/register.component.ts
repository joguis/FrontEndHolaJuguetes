import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  form: any = {
    username: null,
    email: null,
    password: null,
    role: ['seller'],
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  showPassword = false;

  ngOnInit(): void {
    console.log('Creando componente');
  }

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    console.log('registrando cliente');
    const { username, email, password } = this.form;

    this.authService.register(username, email, password, ['seller']).subscribe({
      next: (data) => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      },
    });
  }
}
