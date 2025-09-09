import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable, take } from "rxjs";
import { Job } from "../models/job";
import { Skill } from "../models/skill";

@Injectable()
export class JobService {
  baseUrl = `${environment.apiUrl}/project`;
  constructor(
    private http: HttpClient
  ) { }

  loadJobsMock(): Observable<Job[]>
  {
    return this.http
      .get("assets/mocks/jobs/jobs.mock.json")
      .pipe(
        map(result => (result as any[]).map(j => {
          return {
            ...j,
            createdAt: new Date(j.createdAt)
          } as Job
        })),
        take(1)
      );
  }

  loadCompaniesMock(): Observable<string[]>
  {
    return this.http
      .get("assets/mocks/jobs/company.mock.json")
      .pipe(
        map(result => result as string[]),
        take(1)
      );
  }

  loadCategoriesMock(): Observable<string[]>
  {
    return this.http
      .get("assets/mocks/jobs/category.mock.json")
      .pipe(
        map(result => result as string[]),
        take(1)
      );
  }

  loadSkillsMock(): Observable<Skill[]>
  {
    return this.http
      .get("assets/mocks/jobs/skills.mock.json")
      .pipe(
        map(result => result as Skill[]),
        take(1)
      );
  }
}