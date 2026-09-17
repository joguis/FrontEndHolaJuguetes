import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  clean(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  }

  public saveUser(user: any): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(USER_KEY);
      window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  public getUser(): any {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const user = window.sessionStorage.getItem(USER_KEY);
      if (user) {
        return JSON.parse(user);
      }
    }
    return null;
  }

  public getToken(): string | null {
    const user = this.getUser();
    if (user && user.accessToken) {
      return user.accessToken;
    }
    return null;
  }

  public isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const user = window.sessionStorage.getItem(USER_KEY);
      return user !== null;
    }
    return false;
  }
}
