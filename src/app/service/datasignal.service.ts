import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { GlobalVariable } from '../global';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataSignalService {
  dialogCloseSignal = new Subject<boolean>();
  refreshDataSignal = new Subject<boolean>();

  constructor() {}

  /* Generic function to signal to all context controllers to hide */
  closeDialog() {
    this.dialogCloseSignal.next(true);
  }

  refreshData() {
    this.refreshDataSignal.next(true);
  }
}
