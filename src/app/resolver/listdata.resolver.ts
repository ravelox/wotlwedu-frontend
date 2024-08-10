import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ListDataService } from '../service/listdata.service';

export const listDataResolver: ResolveFn<any> = (route, state) => {
 return inject(ListDataService).getAllData();
};