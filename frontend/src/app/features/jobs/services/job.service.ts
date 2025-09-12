import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { from, map, Observable, take } from "rxjs";
import { Job } from "../models/job";
import { Skill } from "../models/skill";
import Dexie, { Table } from 'dexie';
import { DatabaseService } from "@shared/services/database.service";

@Injectable()
export class JobService {
  baseUrl = `${environment.apiUrl}/project`;

  constructor(
    private http: HttpClient,
    private dbService: DatabaseService
  ) { }

  loadJobsMock(): Observable<Job[]>
  {
    return from(this.dbService.loadJobs());
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
      .get("assets/mocks/company.mock.json")
      .pipe(
        map(result => result as string[]),
        take(1)
      );
  }

  loadCategoriesMock(): Observable<string[]>
  {
    return this.http
      .get("assets/mocks/category.mock.json")
      .pipe(
        map(result => result as string[]),
        take(1)
      );
  }

  loadSkillsMock(): Observable<Skill[]>
  {
    return this.http
      .get("assets/mocks/skills.mock.json")
      .pipe(
        map(result => result as Skill[]),
        take(1)
      );
  }

  getJobsByCompanyId(id: number) {
    return from(this.dbService.getJobsByCompanyId(id))
  }

  getJobsById(ids: number[]) {
    return from(this.dbService.getJobsById(ids))
  }

  updateJob(jobId: number, job: Partial<Job>) {
    this.dbService.updateJob(jobId, job);
  }

  getUsersApplied(jobId: number) {
    return from(this.dbService.getUsersApplied(jobId));
  }

  getUsersById(ids: number[]) {
    return from(this.dbService.getUsersById(ids));
  }

  getAppliedJobs() {
    return from(this.dbService.getAppliedJobs());
  }

  async jobApplied(Jobid: number, userId: number): Promise<boolean> {
    return await this.dbService.getAppliedJob(Jobid, userId) !== undefined;
  }

  saveJobApplied(Jobid: number, userId: number) {
    this.dbService.saveOrApplyJob(Jobid, userId, 1);
  }

  removeJobApplied(Jobid: number, userId: number) {
    this.dbService.removeSavedOrAppliedJob(Jobid, userId, 1);
  }

  saveJobSaved(Jobid: number, userId: number) {
    this.dbService.saveOrApplyJob(Jobid, userId, 2);
  }

  removeJobSaved(Jobid: number, userId: number) {
    this.dbService.removeSavedOrAppliedJob(Jobid, userId, 2);
  }

  getSavedJobs() {
    return from(this.dbService.getSavedJobs());
  }

  async jobSaved(Jobid: number, userId: number): Promise<boolean> {
    return await this.dbService.getSavedJob(Jobid, userId) !== undefined;
  }
}