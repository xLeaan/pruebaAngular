import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { StateEntidad } from '../interfaces/state-entidad';
import { Entidad } from '../interfaces/entidad';
import { catchError, forkJoin, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../enviroment/enviroment.prod';

@Injectable({
  providedIn: 'root'
})
export class EntidadesService {
  private http = inject(HttpClient);
  url: string = environment.apiUrl + 'api/';
  // url: string = 'http://127.0.0.1:8080/';
  
  // Estado con Signal
  #state = signal<StateEntidad>({
    loading: true,
    entidades: []
  });

  entidades = computed(() => this.#state().entidades);
  loading = computed(() => this.#state().loading);

  constructor(private httpClient: HttpClient) {
  }

  public getData(): Observable<Entidad[]> {
    return this.http.get<Entidad[]>(`${this.url}entidades`, {
      responseType: 'json' as 'json'
    });
  }

  create(entidad: Entidad): Observable<Entidad> {
    return this.http.post<Entidad>(`${this.url}entidades`, entidad);
  }
  
  update(id: number, entidad: Entidad): Observable<Entidad> {
    return this.http.put<Entidad>(`${this.url}entidades/${id}`, entidad);
  }
  
  /** Método para refrescar los datos */
  refresh(): void {
    this.#state.set({ loading: true, entidades: [] });

    this.http.get<Entidad[]>(`${this.url}entidades`).subscribe({
      next: (res) => {
        this.#state.set({
          loading: false,
          entidades: res
        });
      },
      error: (error) => {
        console.error('Error al cargar entidades:', error);
      }
    });
    // console.log("Entidades", this.entidades);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}entidades/${id}`);
  }
  
  deleteMultiple(entidades: Entidad[]): Observable<void[]> {
    if (entidades.length === 0) {
        console.warn("No hay entidades seleccionadas para eliminar.");
        return of(); // Retorna un Observable vacío para evitar errores
    }

    const deleteRequests = entidades.map(entidad => {
        console.log(`Eliminando entidad con ID: ${entidad.id}`);
        return this.http.delete<void>(`${this.url}entidades/${entidad.id}`);
    });

    return forkJoin(deleteRequests).pipe(
        tap(() => {
            console.log("Entidades eliminadas con éxito.");
            this.refresh();
        }),
        catchError(error => {
            console.error("Error al eliminar las entidades:", error);
            return throwError(() => error);
        })
    );
}

}
