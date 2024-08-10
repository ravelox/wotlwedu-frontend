import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { Subject } from 'rxjs';
import { WotlweduPreference } from '../datamodel/wotlwedu-preference.model';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { GlobalVariable } from '../global';

@Injectable({ providedIn: 'root' })
export class PreferenceDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduPreference[]>();
  details = new Subject<WotlweduPreference>();
  private ENDPOINT = GlobalVariable.BASE_URL + 'preference/';

  /* Strange thing here...
  We need to use the itemsperpage prefence value to know how
  many items to display in the list of preferences that we 
  get through this service which hasn't been constructed yet
  so this has to be a raw query to the API
  */
  constructor(private http: HttpClient) {
    super();
    this.setCallbackFunction(this.getAllData);
    const url = this.ENDPOINT + 'itemsperpage';
    this.http.get<WotlweduApiResponse>(url).subscribe((response) => {
      if (response.data.preference) {
        this.itemsPerPage = +response.data.preference;
      }
    });
  }

  getData(preferenceName: string) {
    if (!preferenceName || preferenceName === '') return null;
    const url = this.ENDPOINT + preferenceName;
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    const url =
      this.ENDPOINT +
      '?page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');

    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        const objects: WotlweduPreference[] = response.data.preferences;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  savePreference(preferenceId: string, name: string, value: string) {
    const payload = {
      name: name,
      value: value,
    };
    let url = this.ENDPOINT;

    if (preferenceId) {
      url = url + preferenceId;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deletePreference(preferenceId: string) {
    let url = this.ENDPOINT + preferenceId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduPreference) {
    this.details.next(details);
  }
}
