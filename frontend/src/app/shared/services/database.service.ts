import { Injectable } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter, map, take, tap } from "rxjs";
import { AuthService } from "./auth.service";
import Dexie, { Table } from "dexie";
import { Job } from "@features/jobs/models/job";
import { User } from "@shared/models/user";
import { environment } from "environments/environment";
import { HttpClient } from "@angular/common/http";
import { AppliedJobs } from "@shared/models/appliedJobs";
import { SavedJobs } from "@shared/models/savedJobs";
import { Role } from "@core/enums/role";

@Injectable({ providedIn: 'root' })
export class DatabaseService extends Dexie {
  jobs!: Table<Job, number>;
  users!: Table<User, number>;
  savedJobs!: Table<SavedJobs, number>;
  appliedJobs!: Table<AppliedJobs, number>;

  private lastRoute: string | null = null;

  constructor(
    private http: HttpClient
  ) {
    super(environment.localDbName);

    this.version(1)
			.stores({
      	users: '++id,nome,email',
        jobs: '++id,companyId',
        savedJobs: '++id, jobId, userId, [jobId+userId]',
        appliedJobs: '++id, jobId, userId, [jobId+userId]',
    	});
  }

  insertCompanyUsers() {
    this.http
      .get("assets/mocks/users.mock.json")
      .subscribe(async(data) => {
        const users = (data as any[]).map(u => { return { ...u, role: u.role as Role } as User });

        for(let u of users) {
          let user = await this.users.where('id').equals(u.id!).first();
          if(!user) {
            this.users.add(u);
          } else {
            this.users.update(u.id!, u);
          }
        }
      });
  }

  async insertStudentUsers() {
    const users = 
			[
				{
          id: 51,
					email: 'yuri.augusto000@ufu.br',
					name: 'Yuri Augusto da Costa',
					password: 'teste@123',
					role: Role.Student
				},
				{
          id: 52,
					email: 'victor.alves54@ufu.br',
					name: 'Victor Alves Guimarães',
					password: 'teste@123',
					role: Role.Student
				},
				{
          id: 53,
					email: 'joao.melo1@ufu.br',
					name: 'João Lucas Nascimento de Melo',
					password: 'teste@123',
					role: Role.Student
				},
				// restante do grupo
			];

		for(let u of users) {
			const user = await this.users.where('email').equals(u.email).first();

			if(!user) {
				this.users.add(u);
			}
		}
  }

  insertJobs() {
    this.http
      .get("assets/mocks/jobs.mock.json")
      .pipe(
        map(result => (result as any[]).map(j => {
          return {
            ...j,
            createdAt: new Date(j.createdAt)
          } as Job
        })),
        take(1)
      )
      .subscribe(async(data) => {
        this.jobs.bulkAdd(
          data as Job[]
        );
      });
  }

  async getJobsById(ids: number[]) {
    return await this.jobs.bulkGet(ids);
  }

  async getJobsByCompanyId(id: number) {
    return await this.jobs.where('companyId').equals(id).toArray();
  }

  async getUsersById(ids: number[]) {
    return await this.users.bulkGet(ids);
  }

  async getUsersApplied(id: number) {
    return await this.appliedJobs.where('jobId').equals(id).toArray();
  }

  async loadJobs() {
    return this.jobs.toArray();
  }

  async updateJob(jobId: number, job: Partial<Job>) {
    await this.jobs.update(jobId, job);
  }

  async saveOrApplyJob(jobId: number, userId: number, which: number) {
    const table = which == 1 ? this.appliedJobs : this.savedJobs;
    const obj = await table
      .where('[jobId+userId]')
      .equals([jobId, userId])
      .first();

    if(!obj) {
      table.add({
        jobId,
        userId
      } as AppliedJobs);
    }
  }

  async removeSavedOrAppliedJob(jobId: number, userId: number, which: number) {
    const table = which == 1 ? this.appliedJobs : this.savedJobs;
    const obj = await table
      .where('[jobId+userId]')
      .equals([jobId, userId])
      .first();

    if(obj) {
      table.delete(obj.id);
    }
  }

  async getAppliedJobs() {
    return this.appliedJobs.toArray();
  }

  async getAppliedJob(jobId: number, userId: number) {
    return await this.appliedJobs
      .where('[jobId+userId]')
      .equals([jobId, userId])
      .first();
  }

  async getSavedJobs() {
    return this.savedJobs.toArray();
  }

  async getSavedJob(jobId: number, userId: number) {
    return await this.savedJobs
      .where('[jobId+userId]')
      .equals([jobId, userId])
      .first();
  }
}
