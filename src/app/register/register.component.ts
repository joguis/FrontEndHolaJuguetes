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
    role: [],
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  availableRoles: string[] = ['admin', 'seller'];

  onRoleChange(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.form.role.push(value);
    } else {
      this.form.role = this.form.role.filter(
        (role: string) => role !== value
      );
    }
  }

  ngOnInit(): void {
    console.log('Creando componente');
  }

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    console.log('registrando cliente');
    const { username, email, password,role } = this.form;

    this.authService.register(username, email, password, role).subscribe({
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
