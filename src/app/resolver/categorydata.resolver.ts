import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { CategoryDataService } from '../service/categorydata.service';

export const categoryDataResolver: ResolveFn<any> = (route, state) => {
 return inject(CategoryDataService).getAllData();
};