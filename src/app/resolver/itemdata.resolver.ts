import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ItemDataService } from '../service/itemdata.service';

export const itemDataResolver: ResolveFn<any> = (route, state) => {
 return inject(ItemDataService).getAllData();
};