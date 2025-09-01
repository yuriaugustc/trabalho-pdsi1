import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User } from "@shared/models/user";
import { environment } from "environments/environment";
import { map, Observable, take } from "rxjs";
import { UserFilter } from "../models/user-filter";
import { UserProject } from "../models/user-project";
import Dexie, { Table } from 'dexie';

@Injectable()
export class UserService extends Dexie {
  users!: Table<User, number>;
  baseUrl = `${environment.apiUrl}/user`;
  
  constructor(
    private http: HttpClient
  ) { 
    super(environment.localDbName);
    this.version(1)
			.stores({
      	users: '++id,nome,email' // índice por id e nome/email
    	});
  }

  addUserLocal(user: User) {
    return this.users.add(user);
  }

  getUsersLocal() {
    return this.users.toArray();
  }

  updateUserLocal(id: number, changes: Partial<User>) {
    return this.users.update(id, changes);
  }

  deleteUserLocal(id: number) {
    return this.users.delete(id);
  }

  loadUsers(filters: UserFilter): Observable<User[]>
  {
    return this.http
      .get(`${this.baseUrl}/list`, {
        params: {
          ...filters
        }
      })
      .pipe(
        map(result => result as User[]),
        take(1)
      );
  }

  loadUsersAll(): Observable<User[]>
  {
    return this.http
      .get(`${this.baseUrl}/list/all`)
      .pipe(
        map(result => result as User[]),
        take(1)
      );
  }

  createUser(user: User) {
    return this.http
      .post(`${this.baseUrl}/create`, user)
      .pipe(
        map(result => result as User),
        take(1)
      );
  }

  updateUser(user: User) {
    return this.http
      .put(`${this.baseUrl}/update`, user)
      .pipe(
        map(result => result as User),
        take(1)
      );
  }

  deleteUser(id: number) {
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

  getAccesses(id: number): Observable<UserProject[]>
  {
    return this.http
      .get(`${this.baseUrl}/accesses`, {
        params: {
          id
        }
      })
      .pipe(
        map(result => result as UserProject[]),
        take(1)
      );
  }

  updateUserAccesses(accesses: any) {
    return this.http
      .put(`${this.baseUrl}/accesses`, accesses)
      .pipe(
        map(result => result as UserProject[]),
        take(1)
      );
  }
}