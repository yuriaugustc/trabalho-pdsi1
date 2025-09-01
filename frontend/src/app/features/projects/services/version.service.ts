import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Version } from "../models/version";
import { environment } from "environments/environment";
import { map, Observable, take } from "rxjs";
import { VersionFilter } from "../models/version-filter";

@Injectable()
export class VersionService {
  baseUrl = `${environment.apiUrl}/version`;
  constructor(
    private http: HttpClient
  ) { }

  loadVersions(projectId: number, filters: VersionFilter): Observable<Version[]>
  {
    return this.http
      .get(`${this.baseUrl}/list`, {
        params: {
          projectId,
          ...filters
        }
      })
      .pipe(
        map(result => result as Version[]),
        take(1)
      );
  }

  createVersion(version: Version) {

    const formData = new FormData();
    formData.append('number', version.number!);
    formData.append('projectId', version.projectId!.toString());
    formData.append('note', version.note ?? '');
    formData.append('file', version.file!, version.file!.name);

    return this.http
      .post(`${this.baseUrl}/create`, formData)
      .pipe(
        map(result => result as Version),
        take(1)
      );
  }

  updateVersion(version: Version) {
    return this.http
      .put(`${this.baseUrl}/update`, version)
      .pipe(
        map(result => result as Version),
        take(1)
      );
  }

  deleteVersion(id: number) {
    return this.http
      .delete(`${this.baseUrl}/delete`, {
        params: {
          id
        }
      })
      .pipe(
        map(result => result as boolean),
        take(1)
      );
  }
}