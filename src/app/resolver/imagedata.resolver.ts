import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ImageDataService } from '../service/imagedata.service';

export const imageDataResolver: ResolveFn<any> = (route, state) => {
 return inject(ImageDataService).getAllData();
};