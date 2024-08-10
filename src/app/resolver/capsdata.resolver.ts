import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { CapDataService } from '../service/capdata.service';

export const capsDataResolver: ResolveFn<any> = (route, state) => {
 return inject(CapDataService).getAllData();
};