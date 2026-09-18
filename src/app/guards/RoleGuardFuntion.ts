import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage-service.service';

export function roleGuard(expectedRoles: string[]): CanActivateFn {
    return (route, state) => {
        const storageService = inject(StorageService);
        const router = inject(Router);
        
        const user = storageService.getUser();
        console.log("Verificando roles");
        if (user && user.roles) {
            const hasRole = expectedRoles.some((role) => user.roles.includes(role));
            if (hasRole) {
                console.log("Usuario tiene el rol requerido");
                return true;
            }
        }
        console.log("Usuario no tiene el rol requerido, redirigiendo a login");
        router.navigate(['/login']);
        return false;
            
    };
}