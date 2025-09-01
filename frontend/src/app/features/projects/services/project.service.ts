import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Project } from "../models/project";
import { environment } from "environments/environment";
import { map, Observable, take } from "rxjs";
import { ProjectFilter } from "../models/project-filter";

@Injectable()
export class ProjectService {
  baseUrl = `${environment.apiUrl}/project`;
  constructor(
    private http: HttpClient
  ) { }

  loadProjects(filters: ProjectFilter): Observable<Project[]>
  {
    return this.http
      .get(`${this.baseUrl}/list`, {
        params: {
          ...filters
        }
      })
      .pipe(
        map(result => result as Project[]),
        take(1)
      );
  }

  loadAllProjects(): Observable<Project[]>
  {
    return this.http
      .get(`${this.baseUrl}/list/all`)
      .pipe(
        map(result => result as Project[]),
        take(1)
      );
  }

  createProject(project: Project) {
    return this.http
      .post(`${this.baseUrl}/create`, project)
      .pipe(
        map(result => result as Project),
        take(1)
      );
  }

  updateProject(project: Project) {
    return this.http
      .put(`${this.baseUrl}/update`, project)
      .pipe(
        map(result => result as Project),
        take(1)
      );
  }

  deleteProject(id: number) {
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