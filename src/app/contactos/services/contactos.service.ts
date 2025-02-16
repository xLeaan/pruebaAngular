import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { StateContacto } from '../interfaces/state-contacto';
import { Contacto } from '../interfaces/contacto';
import { catchError, forkJoin, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../enviroment/enviroment.prod';

@Injectable({
  providedIn: 'root'
})
export class ContactosService {
  private http = inject(HttpClient);
  url: string = environment.apiUrl;
  
  #state = signal<StateContacto>({
    loading: true,
    contactos: []
  });

  contactos = computed(() => this.#state().contactos);
  loading = computed(() => this.#state().loading);

  constructor(private httpClient: HttpClient) {
  }

  public getContactos(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(`${this.url}contactos`, {
      responseType: 'json' as 'json'
    });
  }

  create(contacto: Contacto): Observable<Contacto> {
    return this.http.post<Contacto>(`${this.url}contactos`, contacto).pipe(
      tap((newContacto) => {
        console.log('Nuevo contacto creado:', newContacto);
        this.#state.set({
          loading: false,
          contactos: [...this.#state().contactos, newContacto],
        });
      }),
      catchError((error) => {
        console.error("Error creando contacto:", error);
        return throwError(() => error);
      })
    );
  }
  
  
  update(id: number, contacto: Contacto): Observable<Contacto> {
    return this.http.put<Contacto>(`${this.url}contactos/${id}`, contacto);
  }
  
  /** Método para refrescar los datos */
  refresh(): void {
    this.#state.set({ loading: true, contactos: [] });

    this.http.get<Contacto[]>(`${this.url}contactos`).subscribe({
      next: (res) => {
        this.#state.set({
          loading: false,
          contactos: res
        });
      },
      error: (error) => {
        console.error('Error al cargar contactos:', error);
      }
    });
    // console.log("Contactos", this.contactos);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}contactos/${id}`);
  }
  
  deleteMultiple(contactos: Contacto[]): Observable<void[]> {
    if (contactos.length === 0) {
        console.warn("No hay entidades seleccionadas para eliminar.");
        return of(); // Retorna un Observable vacío para evitar errores
    }

    const deleteRequests = contactos.map(contacto => {
        console.log(`Eliminando contacto con ID: ${contacto.id}`);
        return this.http.delete<void>(`${this.url}contactos/${contacto.id}`);
    });

    return forkJoin(deleteRequests).pipe(
        tap(() => {
            console.log("Contactos eliminados con éxito.");
            this.refresh();
        }),
        catchError(error => {
            console.error("Error al eliminar las entidades:", error);
            return throwError(() => error);
        })
    );
}

}
