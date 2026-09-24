import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { InventoryService, InventoryRecord, InventoryResource, MovementType, PageResponse } from '../services/inventory.service';

interface ResourceConfig { label: string; singular: string; fields: string[]; }
const CONFIG: Record<InventoryResource, ResourceConfig> = {
  categorias: { label: 'Categorías', singular: 'Categoría', fields: ['nombre', 'descripcion'] }, subcategorias: { label: 'Subcategorías', singular: 'Subcategoría', fields: ['nombre'] }, proveedores: { label: 'Proveedores', singular: 'Proveedor', fields: ['nombre', 'telefono', 'email'] }, 'grupos-venta': { label: 'Grupos de venta', singular: 'Grupo de venta', fields: ['nombre', 'categoriaId', 'subcategoriaId', 'precioVenta'] }, productos: { label: 'Productos', singular: 'Producto', fields: ['sku', 'nombre', 'grupoVentaId', 'proveedorId', 'precioCosto', 'cantidad', 'activo'] }, movimientos: { label: 'Movimientos', singular: 'Movimiento', fields: ['referencia', 'productoId', 'tipoMovimiento', 'cantidad', 'motivo'] }
};

@Component({ selector: 'app-board-admin', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './board-admin.component.html', styleUrl: './board-admin.component.css' })
export class BoardAdminComponent implements OnInit {
  resource: InventoryResource = 'categorias'; records: InventoryRecord[] = []; config = CONFIG.categorias; page = 0; size = 20; totalPages = 0; totalElements = 0; term = ''; loading = false; saving = false; error = ''; success = ''; editing?: InventoryRecord; form: Record<string, unknown> = {};
  categories: InventoryRecord[] = [];
  subcategories: InventoryRecord[] = [];
  activeReference = '';
  readonly resources = Object.entries(CONFIG).map(([key, value]) => ({ key: key as InventoryResource, ...value }));
  constructor(private inventory: InventoryService, private route: ActivatedRoute) {}
  ngOnInit(): void { this.loadLookups(); this.route.data.subscribe(data => { this.resource = (data['resource'] as InventoryResource) || 'categorias'; this.config = CONFIG[this.resource]; this.resetForm(); this.load(); }); }
  loadLookups(): void {
    this.inventory.list<InventoryRecord>('categorias', 0, 100).subscribe({ next: response => this.categories = response.content ?? [] });
    this.inventory.list<InventoryRecord>('subcategorias', 0, 100).subscribe({ next: response => this.subcategories = response.content ?? [] });
  }
  load(): void { const requestedPage = this.page; this.loading = true; this.inventory.list(this.resource, requestedPage, this.size, this.term).subscribe({ next: (response: PageResponse<InventoryRecord>) => { this.records = response.content ?? []; this.page = requestedPage; this.totalPages = response.totalPages ?? 0; this.totalElements = response.totalElements ?? this.records.length; this.loading = false; }, error: error => { this.error = this.readError(error); this.loading = false; } }); }
  search(): void { this.page = 0; this.load(); }
  edit(record: InventoryRecord): void { this.editing = record; this.form = { ...record }; if (this.resource === 'grupos-venta') { const categoriaId = record['categoriaId'] ?? record['idCategoria'] ?? this.relatedId(record['categoria']); const subcategoriaId = record['subcategoriaId'] ?? record['idSubcategoria'] ?? this.relatedId(record['subcategoria']); this.form['categoriaId'] = categoriaId ?? ''; this.form['subcategoriaId'] = subcategoriaId ?? ''; this.form['categoriaNombre'] = this.lookupName(this.categories, categoriaId); this.form['subcategoriaNombre'] = this.lookupName(this.subcategories, subcategoriaId); } this.success = ''; }
  cancel(): void { this.editing = undefined; this.resetForm(); }
  save(): void { this.saving = true; const id = this.editing?.['id'] as number | undefined; const payload: Record<string, unknown> = { ...this.form, ...(id ? { id } : {}) }; delete payload['categoriaNombre']; delete payload['subcategoriaNombre']; ['categoriaId', 'subcategoriaId', 'grupoVentaId', 'proveedorId', 'productoId', 'cantidad', 'precioVenta', 'precioCosto'].forEach(field => { if (payload[field] !== '' && payload[field] !== undefined) payload[field] = Number(payload[field]); }); this.inventory.save(this.resource, payload, id).subscribe({ next: () => { this.success = `${this.config.singular} guardado correctamente.`; this.saving = false; this.cancel(); this.load(); }, error: error => { this.error = this.readError(error); this.saving = false; } }); }
  remove(record: InventoryRecord): void { if (!record['id'] || !confirm(`¿Eliminar este ${this.config.singular.toLowerCase()}?`)) return; this.inventory.remove(this.resource, record['id'] as number).subscribe({ next: () => this.load(), error: error => this.error = this.readError(error) }); }
  previous(): void { if (this.page > 0) { this.page--; this.load(); } } next(): void { if (this.page + 1 < this.totalPages) { this.page++; this.load(); } }
  display(value: unknown): string { return value === null || value === undefined ? '—' : String(value); }
  displayField(record: InventoryRecord, field: string): string {
    const aliases: Record<string, string[]> = {
      nombre: ['nombre', 'nombreProveedor', 'razonSocial'],
      telefono: ['telefono', 'celular', 'telefonoContacto', 'telefonoProveedor', 'telefono_proveedor'],
      email: ['email', 'correo', 'correoElectronico', 'correo_electronico', 'emailProveedor'],
      referencia: ['referencia', 'numeroReferencia', 'numero_referencia', 'reference'],
      categoriaId: ['categoriaId', 'idCategoria', 'categoria_id', 'categoriaID'],
      subcategoriaId: ['subcategoriaId', 'idSubcategoria', 'subcategoria_id', 'subcategoriaID'],
      grupoVentaId: ['grupoVentaId', 'idGrupoVenta', 'grupo_venta_id', 'grupoVentaID'],
      proveedorId: ['proveedorId', 'idProveedor', 'proveedor_id', 'proveedorID']
    };
    const keys = aliases[field] ?? [field];
    for (const key of keys) if (record[key] !== undefined && record[key] !== null) return this.display(record[key]);
    const relatedFields: Record<string, string[]> = {
      categoriaId: ['categoria'],
      subcategoriaId: ['subcategoria'],
      grupoVentaId: ['grupoVenta', 'grupo_venta'],
      proveedorId: ['proveedor']
    };
    for (const key of relatedFields[field] ?? []) {
      const relatedId = this.relatedId(record[key]);
      if (relatedId !== undefined) return this.display(relatedId);
    }
    return '—';
  }
  private relatedId(value: unknown): unknown {
    return value && typeof value === 'object' ? (value as Record<string, unknown>)['id'] : undefined;
  }
  isGroupField(field: string): boolean { return this.resource === 'grupos-venta' && (field === 'categoriaId' || field === 'subcategoriaId'); }
  optionsFor(field: string): InventoryRecord[] { return field === 'categoriaId' ? this.categories : this.subcategories; }
  optionLabel(option: InventoryRecord): string { return this.display(option['nombre'] ?? option['name']); }
  lookupName(options: InventoryRecord[], id: unknown): string { const option = options.find(item => String(item['id']) === String(id)); return option ? this.optionLabel(option) : ''; }
  selectLookup(field: string, name: string): void { if (field !== 'categoriaId' && field !== 'subcategoriaId') return; const option = this.optionsFor(field).find(item => this.optionLabel(item).toLowerCase() === name.trim().toLowerCase()); this.form[field] = option?.['id'] ?? ''; }
  advanceReference(type: MovementType): void { this.inventory.nextReference(type).subscribe({ next: reference => this.activeReference = reference, error: error => this.error = this.readError(error) }); }
  private resetForm(): void { this.editing = undefined; this.form = {}; this.config.fields.forEach(field => this.form[field] = field === 'activo' ? true : field === 'cantidad' ? 0 : field === 'tipoMovimiento' ? 'ENTRADA' : ''); }
  private readError(error: any): string { return error?.error?.message || error?.error || 'No se pudo completar la operación.'; }
}