import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { InventoryService, InventoryRecord, InventoryResource, PageResponse } from '../services/inventory.service';

interface ResourceConfig { label: string; singular: string; fields: string[]; }
const CONFIG: Record<InventoryResource, ResourceConfig> = {
  categorias: { label: 'Categorías', singular: 'Categoría', fields: ['nombre', 'descripcion'] }, subcategorias: { label: 'Subcategorías', singular: 'Subcategoría', fields: ['nombre'] }, proveedores: { label: 'Proveedores', singular: 'Proveedor', fields: ['nombre', 'telefono', 'email'] }, 'grupos-venta': { label: 'Grupos de venta', singular: 'Grupo de venta', fields: ['nombre', 'categoriaId', 'subcategoriaId', 'precioVenta'] }, productos: { label: 'Productos', singular: 'Producto', fields: ['sku', 'nombre', 'grupoVentaId', 'proveedorId', 'precioCosto', 'cantidad', 'activo'] }, movimientos: { label: 'Movimientos', singular: 'Movimiento', fields: ['productoId', 'tipoMovimiento', 'cantidad', 'motivo'] }
};

@Component({ selector: 'app-board-admin', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './board-admin.component.html', styleUrl: './board-admin.component.css' })
export class BoardAdminComponent implements OnInit {
  resource: InventoryResource = 'categorias'; records: InventoryRecord[] = []; config = CONFIG.categorias; page = 0; size = 10; totalPages = 0; term = ''; loading = false; saving = false; error = ''; success = ''; editing?: InventoryRecord; form: Record<string, unknown> = {};
  readonly resources = Object.entries(CONFIG).map(([key, value]) => ({ key: key as InventoryResource, ...value }));
  constructor(private inventory: InventoryService, private route: ActivatedRoute) {}
  ngOnInit(): void { this.route.data.subscribe(data => { this.resource = (data['resource'] as InventoryResource) || 'categorias'; this.config = CONFIG[this.resource]; this.resetForm(); this.load(); }); }
  load(): void { this.loading = true; this.inventory.list(this.resource, this.page, this.size, this.term).subscribe({ next: (response: PageResponse<InventoryRecord>) => { this.records = response.content ?? []; this.totalPages = response.totalPages ?? 0; this.loading = false; }, error: error => { this.error = this.readError(error); this.loading = false; } }); }
  search(): void { this.page = 0; this.load(); }
  edit(record: InventoryRecord): void { this.editing = record; this.form = { ...record }; this.success = ''; }
  cancel(): void { this.editing = undefined; this.resetForm(); }
  save(): void { this.saving = true; const id = this.editing?.['id'] as number | undefined; const payload = { ...this.form, ...(id ? { id } : {}) }; this.inventory.save(this.resource, payload, id).subscribe({ next: () => { this.success = `${this.config.singular} guardado correctamente.`; this.saving = false; this.cancel(); this.load(); }, error: error => { this.error = this.readError(error); this.saving = false; } }); }
  remove(record: InventoryRecord): void { if (!record['id'] || !confirm(`¿Eliminar este ${this.config.singular.toLowerCase()}?`)) return; this.inventory.remove(this.resource, record['id'] as number).subscribe({ next: () => this.load(), error: error => this.error = this.readError(error) }); }
  previous(): void { if (this.page > 0) { this.page--; this.load(); } } next(): void { if (this.page + 1 < this.totalPages) { this.page++; this.load(); } }
  display(value: unknown): string { return value === null || value === undefined ? '—' : String(value); }
  private resetForm(): void { this.editing = undefined; this.form = {}; this.config.fields.forEach(field => this.form[field] = field === 'activo' ? true : field === 'cantidad' ? 0 : field === 'tipoMovimiento' ? 'ENTRADA' : ''); }
  private readError(error: any): string { return error?.error?.message || error?.error || 'No se pudo completar la operación.'; }
}