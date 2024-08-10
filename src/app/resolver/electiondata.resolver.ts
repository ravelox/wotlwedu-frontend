import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ElectionDataService } from '../service/electiondata.service';

export const electionDataResolver: ResolveFn<any> = (route, state) => {
 return inject(ElectionDataService).getAllData();
};