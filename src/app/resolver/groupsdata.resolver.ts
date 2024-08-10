import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { GroupDataService } from '../service/groupdata.service';

export const groupsDataResolver: ResolveFn<any> = (route, state) => {
 return inject(GroupDataService).getAllData();
};