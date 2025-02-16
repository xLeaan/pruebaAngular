import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { EntidadesService } from './services/entidades.service';
import { Entidad } from './interfaces/entidad';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-entidades',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    ReactiveFormsModule,
    FormsModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule
  ],
  templateUrl: './entidades.component.html',
  styleUrls: ['./entidades.component.css'],
  providers: [MessageService, ConfirmationService]
})
export default class EntidadesComponent  {
  entidadForm: FormGroup;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  selectedEntidad: Entidad | null = null;

  public entidadesService = inject(EntidadesService);
  total = computed(() => this.entidadesService.entidades().length);

  entidades: Entidad[] = [];
  loading: boolean = true;
  selectedEntidades: any[] = [];
  data: any;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private toast: MessageService
  ) {
    this.entidadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      nit: [''],
      telefono: ['', [Validators.maxLength(15)]],
      direccion: ['', [Validators.maxLength(255)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.entidadesService.getData().subscribe(data => {
      this.entidades = data;
      this.loading = false;
      this.entidadesService.refresh();
    });
  }

  deleteSelected(): void {
    if (this.selectedEntidades.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'No hay entidades seleccionadas' });
        return;
    }

    this.confirmationService.confirm({
        message: `¿Estás seguro de que quieres eliminar ${this.selectedEntidades.length} entidades?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            console.log("Entidades a eliminar:", this.selectedEntidades);

            this.entidadesService.deleteMultiple(this.selectedEntidades).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entidades eliminadas correctamente' });

                    // Filtra las entidades eliminadas para actualizar la tabla
                    this.entidades = this.entidades.filter(e => !this.selectedEntidades.includes(e));
                    this.selectedEntidades = [];
                },
                error: (err) => {
                    console.error('Error eliminando entidades', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron eliminar las entidades' });
                }
            });
        },
        reject: () => {
            this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Eliminación cancelada' });
        }
    });
}

  delete(entidad: Entidad) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar la entidad ${entidad.nombre}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.entidadesService.delete(entidad.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Entidad eliminada correctamente' });
            this.entidades = this.entidades.filter(e => e.id !== entidad.id);
          },
          error: (err) => {
            console.error('Error eliminando entidad', err);
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la entidad' });
          }
        });
      },
      reject: () => {
        this.toast.add({ severity: 'info', summary: 'Cancelado', detail: 'Eliminación cancelada' });
      }
    });
  }

  openNew() {
    this.isEditMode = false;
    this.entidadForm.reset();
    this.modalVisible = true;
  }

  edit(entidad: Entidad) {
    this.isEditMode = true;
    this.selectedEntidad = { ...entidad };
    this.entidadForm.patchValue(this.selectedEntidad);
    this.modalVisible = true;
  }

  saveEntidad() {
    if (this.entidadForm.invalid) {
      return;
    }

    const entidadData = this.entidadForm.value;

    if (this.isEditMode && this.selectedEntidad) {
      this.entidadesService.update(this.selectedEntidad.id, entidadData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entidad actualizada' });
          this.modalVisible = false;
          this.entidadesService.refresh();
        },
        error: (err) => console.error('Error actualizando entidad', err),
      });
    } else {
      this.entidadesService.create(entidadData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entidad creada' });
          this.modalVisible = false;
          this.entidadesService.refresh();
        },
        error: (err) => console.error('Error creando entidad', err),
      });
    }
  }
}