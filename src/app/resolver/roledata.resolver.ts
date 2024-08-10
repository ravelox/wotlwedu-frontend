import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { RoleDataService } from '../service/roledata.service';

export const roleDataResolver: ResolveFn<any> = (route, state) => {
 return inject(RoleDataService).getAllData();
};