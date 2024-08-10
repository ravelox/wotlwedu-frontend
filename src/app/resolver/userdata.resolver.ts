import { ResolveFn } from '@angular/router';
import { UserDataService } from '../service/userdata.service';
import { inject } from '@angular/core';

export const userdataResolver: ResolveFn<any> = (route, state) => {
  return inject(UserDataService).getAllData();
};