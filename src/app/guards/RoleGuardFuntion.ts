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
        const fallback = user?.roles?.includes('ROLE_ADMIN')
            ? '/dashboard'
            : user?.roles?.some((role: string) => ['ROLE_SELLER', 'ROLE_VENDEDOR'].includes(role))
                ? '/movimientos/registrar'
                : '/login';
        router.navigate([fallback]);
        return false;
            
    };
}