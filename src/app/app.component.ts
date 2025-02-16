import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EntidadesService } from './entidades/services/entidades.service';
import { ContactosService } from './contactos/services/contactos.service';
import ContactosComponent from "./contactos/contactos.component";
import EntidadesComponent from "./entidades/entidades.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ContactosComponent, EntidadesComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  data: any[] = [];
  contactos: any[] = [];
  title = 'prueba';

  constructor(
    private apiService: EntidadesService,
    private contactosService: ContactosService
  ) {}

  ngOnInit(): void {
    this.datos();
  }

  datos() {
    this.apiService.getData().subscribe(data => {
      this.data = data;
      // console.log(this.data);
    });
  }

  obtenerContactos() {
    this.contactosService.getContactos().subscribe(contactos => {
      this.contactos = contactos;
    });
  }
}