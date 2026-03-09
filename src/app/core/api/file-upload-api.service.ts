import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../tokens';

export interface FileUploadResponse {
  id: string;
  status: number;
  message: string;
  timestamp: string;
  data: string; // URL of the uploaded file
}

@Injectable({ providedIn: 'root' })
export class FileUploadApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * Upload a single file
   * @param file The file to upload
   * @returns Observable with the upload response containing the file URL
   */
  upload(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(
      `${this.baseUrl}/api/files/upload`,
      formData
    );
  }
}
