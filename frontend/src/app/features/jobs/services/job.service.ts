import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable, take } from "rxjs";
import { Job } from "../models/job";
import { Skill } from "../models/skill";
import Dexie, { Table } from 'dexie';

@Injectable()
export class JobService extends Dexie {
  jobsApplied!: Table<Job, number>;
  jobsSaved!: Table<Job, number>;
  baseUrl = `${environment.apiUrl}/project`;

  constructor(
    private http: HttpClient
  ) { 
    super(environment.localDbName); // nome do banco
    this.version(1)
			.stores({
      	jobsApplied: '++id',
      	jobsSaved: '++id',
    	});
  }

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

  loadJobByIdMock(id: number): Observable<Job>
  {
    return this.loadJobsMock().pipe(
      map(data => data.find(j => j.id === id)!)
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

  async getAppliedJobs() {
    return await this.jobsApplied.toArray();
  }

  jobApplied(id: number): boolean {
    return this.jobsApplied.where('id').equals(id) !== undefined;
  }

  saveJobApplied(job: Job) {
    this.jobsApplied.add(job);
  }

  removeJobApplied(id: number) {
    this.jobsApplied.delete(id);
  }

  async getSavedJobs() {
    return await this.jobsSaved.toArray();
  }

  jobSaved(id: number): boolean {
    return this.jobsSaved.where('id').equals(id) !== undefined;
  }

  saveJobSaved(job: Job) {
    this.jobsSaved.add(job);
  }

  removeJobSaved(id: number) {
    this.jobsSaved.delete(id);
  }
}