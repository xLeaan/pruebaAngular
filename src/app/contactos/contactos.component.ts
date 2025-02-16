import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ContactosService } from './services/contactos.service';
import { Contacto } from './interfaces/contacto';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EntidadesService } from '../entidades/services/entidades.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-contactos',
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
    DialogModule,
    DropdownModule
  ],
  templateUrl: './contactos.component.html',
  styleUrls: ['./contactos.component.css'],
  providers: [MessageService, ConfirmationService]
})
export default class ContactosComponent  {
  contactoForm: FormGroup;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  selectedContacto: Contacto | null = null;

  public contactosService = inject(ContactosService);
  total = computed(() => this.contactosService.contactos().length);

  contactos: Contacto[] = [];
  loading: boolean = true;
  selectedContactos: any[] = [];
  entidades: any[] = [];
  data: any;

  loadEntidades() {
    this.entidadService.getData().subscribe(
      (data) => {
        this.entidades = data;
      },
      (error) => {
        console.error('Error al cargar las entidades:', error);
      }
    );
  }

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private toast: MessageService,
    private entidadService: EntidadesService
  ) {
    this.contactoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      entidad_id: ['', Validators.required],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.maxLength(15)]],
      direccion: ['', [Validators.maxLength(255)]],
      notas: ['', [Validators.maxLength(255)]],
      fecha_nacimiento: ['', [Validators.maxLength(255)]],
      identificacion: ['', [Validators.required, Validators.maxLength(255)]]
    });

    this.loadEntidades();
  }

  ngOnInit(): void {
    this.contactosService.getContactos().subscribe(contactos => {
      this.contactos = contactos;
      this.loading = false;
      this.contactosService.refresh();
    });
    console.log("Contactos", this.contactos);
  }

  deleteSelected(): void {
    if (this.selectedContactos.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'No hay contactos seleccionados' });
        return;
    }

    this.confirmationService.confirm({
        message: `¿Estás seguro de que quieres eliminar ${this.selectedContactos.length} contactos?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            console.log("Contactos a eliminar:", this.selectedContactos);

            this.contactosService.deleteMultiple(this.selectedContactos).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'COntactos eliminadas correctamente' });

                    // Filtra las entidades eliminadas para actualizar la tabla
                    this.contactos = this.contactos.filter(e => !this.selectedContactos.includes(e));
                    this.selectedContactos = [];
                },
                error: (err) => {
                    console.error('Error eliminando contactos', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron eliminar los contactos' });
                }
            });
        },
        reject: () => {
            this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Eliminación cancelada' });
        }
    });
}

  delete(contacto: Contacto) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el contacto ${contacto.nombre}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contactosService.delete(contacto.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Contacto eliminado correctamente' });
            this.contactos = this.contactos.filter(e => e.id !== contacto.id);
          },
          error: (err) => {
            console.error('Error eliminando contacto', err);
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el contacto' });
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
    this.contactoForm.reset();
    this.modalVisible = true;
  }

  edit(contacto: Contacto) {
    this.isEditMode = true;
    this.selectedContacto = { ...contacto };
    this.contactoForm.patchValue(this.selectedContacto);
    this.modalVisible = true;
  }

  saveContacto() {
    if (this.contactoForm.invalid) {
      return;
    }

    console.log("CONTACTO", this.contactoForm.value);
  
    const contactoData = { ...this.contactoForm.value };
  
   
  
    if (this.isEditMode && this.selectedContacto) {
      this.contactosService.update(this.selectedContacto.id, contactoData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contacto actualizado' });
          this.modalVisible = false;
          this.contactosService.refresh();
        },
        error: (err) => console.error('Error actualizando el contacto', err),
      });
    } else {
      this.contactosService.create(contactoData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contacto creado' });
          this.modalVisible = false;
          this.contactosService.refresh();
        },
        error: (err) => console.error('Error creando el contacto', err),
      });
    }
  }
  
}