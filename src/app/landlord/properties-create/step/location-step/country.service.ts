import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, shareReplay, tap } from 'rxjs';
import { Country } from './country.model';
import { State } from '../../../../core/model/state.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  http = inject(HttpClient);

  private countries$: WritableSignal<State<Array<Country>>> =
    signal(State.Builder<Array<Country>>().forInit());
  countries = computed(() => this.countries$());

  private fetchCountry$ = new Observable<Array<Country>>();

  constructor() {
    this.initFetchGetAllCountries();
    this.fetchCountry$.subscribe();
  }

  initFetchGetAllCountries(): void {
    this.fetchCountry$ = this.http.get<Array<Country>>("/assets/countries.json")
      .pipe(
        tap(countries =>
          this.countries$.set(State.Builder<Array<Country>>().forSuccess(countries))),
        catchError(err => {
          this.countries$.set(State.Builder<Array<Country>>().forError(err));
          return of(err);
        }),
        shareReplay(1)
      );
  }
}
