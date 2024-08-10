import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { VoteDataService } from '../service/votedata.service';

export const voteDataResolver: ResolveFn<any> = (route, state) => {
 return inject(VoteDataService).getAllData();
};