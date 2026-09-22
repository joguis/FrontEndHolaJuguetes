import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryRecord, MovementType } from '../services/inventory.service';

@Component({ selector: 'app-board-seller', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './board-seller.component.html', styleUrl: './board-seller.component.css' })
export class BoardSellerComponent implements OnInit {
  products: InventoryRecord[] = [];
  type: MovementType = 'ENTRADA';
  activeReference = '';
  loading = false;
  message = '';
  error = '';
  form = { productoId: '', cantidad: 1, motivo: '' };
  constructor(private inventory: InventoryService) {}

  ngOnInit(): void {
    this.inventory.list<InventoryRecord>('productos', 0, 100).subscribe({ next: response => this.products = response.content ?? [], error: error => this.error = this.readError(error) });
    this.advance('ENTRADA');
  }
  setType(type: MovementType): void { this.type = type; }
  advance(type: MovementType): void {
    this.error = ''; this.activeReference = '';
    this.inventory.nextReference(type).subscribe({ next: reference => this.activeReference = this.parseReference(reference), error: error => this.error = this.readError(error) });
  }
  submit(): void {
    if (!this.form.productoId) {
      this.error = 'Selecciona un producto para registrar el movimiento.';
      return;
    }
    this.loading = true; this.message = ''; this.error = '';
    this.inventory.save('movimientos', { referencia: this.activeReference, productoId: Number(this.form.productoId), tipoMovimiento: this.type, cantidad: Number(this.form.cantidad), motivo: this.form.motivo }).subscribe({
      next: () => { this.message = 'Movimiento registrado correctamente.'; this.form = { productoId: '', cantidad: 1, motivo: '' }; this.loading = false; },
      error: error => { this.error = this.readError(error); this.loading = false; }
    });
  }
  private parseReference(reference: string): string { return typeof reference === 'string' ? reference.replace(/^Fact/i, 'fact').replace(/^Ticket/i, 'ticket') : reference; }
  private readError(error: any): string { return error?.error?.message || error?.error || 'No se pudo conectar con el servicio de inventario.'; }
}