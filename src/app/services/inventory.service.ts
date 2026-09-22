import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type InventoryResource = 'categorias' | 'subcategorias' | 'proveedores' | 'grupos-venta' | 'productos' | 'movimientos';
export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION';
export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
export interface InventoryRecord { [key: string]: unknown; id?: number; }

interface BackendPageResponse<T> {
  contenido: T[];
  pagina: number;
  tamanoPagina: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = 'http://localhost:5000/api';
  constructor(private http: HttpClient) {}

  list<T extends InventoryRecord>(resource: InventoryResource, page = 0, size = 10, term = '', productId?: number): Observable<PageResponse<T>> {
    const body: Record<string, unknown> = { page, size };
    if (term.trim()) body['termino'] = term.trim();
    if (productId) body['productoId'] = productId;
    const endpoint = this.endpoint(resource);
    const request$ = term.trim()
      ? this.http.post<BackendPageResponse<T>>(`${endpoint}/buscar`, body)
      : this.http.get<BackendPageResponse<T>>(endpoint, {
        params: new HttpParams().set('page', page).set('size', size)
      });

    return request$.pipe(map(response => this.toPageResponse(response, page, size)));
  }
  save<T>(resource: InventoryResource, payload: object, id?: number): Observable<T> {
    const endpoint = this.endpoint(resource);
    return id ? this.http.patch<T>(endpoint, payload) : this.http.post<T>(endpoint, payload);
  }
  remove(resource: InventoryResource, id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(resource), { body: { id } });
  }
  nextReference(type: MovementType): Observable<string> {
    return this.http.post(`${this.api}/movimientos-inventario/siguiente-referencia`, { tipoMovimiento: type }, { responseType: 'text' }).pipe(
      map(response => this.readReference(response))
    );
  }
  private readReference(response: string): string {
    const value = response.trim();
    if (!value) return '';
    try {
      const parsed: unknown = JSON.parse(value);
      if (typeof parsed === 'string') return parsed;
      if (parsed && typeof parsed === 'object') {
        const data = parsed as Record<string, unknown>;
        return String(data['referencia'] ?? data['numeroReferencia'] ?? data['reference'] ?? value);
      }
    } catch {
      return value;
    }
    return value;
  }
  private toPageResponse<T>(response: BackendPageResponse<T> | T[], page: number, size: number): PageResponse<T> {
    if (Array.isArray(response)) {
      return { content: response, totalElements: response.length, totalPages: response.length ? 1 : 0, number: page, size };
    }
    const content = response.contenido;
    const totalElements = response.totalElementos;
    return {
      content,
      totalElements,
      totalPages: response.totalPaginas,
      number: response.pagina,
      size: response.tamanoPagina
    };
  }
  private endpoint(resource: InventoryResource): string {
    return `${this.api}/${resource === 'movimientos' ? 'movimientos-inventario' : resource}`;
  }
}