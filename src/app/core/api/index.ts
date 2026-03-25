// Base API service
export { BaseApiService } from './base-api.service';

// Domain API services
export { SubjectApiService } from './subject-api.service';
export { GradeApiService } from './grade-api.service';
export { TeacherApiService } from './teacher-api.service';
export { ClassApiService } from './class-api.service';
export { ScheduleApiService } from './schedule-api.service';
export { NewsApiService } from './news-api.service';
export { AccountApiService } from './account-api.service';
export { RegistrationApiService } from './registration-api.service';
export { ConsultationApiService } from './consultation-api.service';

// File upload service
export { FileUploadApiService, type FileUploadResponse } from './file-upload-api.service';

// Resource URL service — resolves the MinIO base URL based on HTTP/HTTPS protocol
export { ResourceUrlService } from './resource-url.service';
