import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export abstract class BaseService {
  protected anonymousHeader() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
  }

  protected extractData(response: any) {
    return response.data || {};
  }

  protected resp(response: any) {
    return response || {};
  }

  protected serviceError(response: Response | any) {
    let customError: string[] = [];
    let customResponse = new Error();
    if (response instanceof HttpErrorResponse) {
      if (response.statusText === 'Unknown Error') {
        customError.push('Unknown Error');
        response.error.errors = customError;
      }
    }
    if (response.status === 500) {
      customError.push('Error processing request');
      customResponse.error.errors = customError;
      return throwError(() => customResponse);
    }
    return throwError(() => response);
  }
}

class Error {
  error: ErrorResponse = new ErrorResponse();
}

class ErrorResponse {
  errors: string[] = [];
}
