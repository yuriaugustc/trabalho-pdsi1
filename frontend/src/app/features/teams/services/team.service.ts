import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Team } from "../models/team";
import { environment } from "environments/environment";
import { map, Observable, take } from "rxjs";
import { TeamFilter } from "../models/team-filter";
import { TeamMembers } from "../components/members/teams-members.component";
import { TeamMember } from "../models/team-member";

@Injectable()
export class TeamService {
  baseUrl = `${environment.apiUrl}/team`;
  constructor(
    private http: HttpClient
  ) { }

  loadTeams(filters: TeamFilter): Observable<Team[]> {
    return this.http
      .get(`${this.baseUrl}/list`, {
        params: {
          ...filters
        }
      })
      .pipe(
        map(result => result as Team[]),
        take(1)
      );
  }

  createTeam(team: Team) {
    return this.http
      .post(`${this.baseUrl}/create`, team)
      .pipe(
        map(result => result as Team),
        take(1)
      );
  }

  updateTeam(team: Team) {
    return this.http
      .put(`${this.baseUrl}/update`, team)
      .pipe(
        map(result => result as Team),
        take(1)
      );
  }

  deleteTeam(id: number) {
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

  getTeamMembers(id: number) {
    return this.http
      .get(`${this.baseUrl}/members`, {
        params: {
          id
        }
      })
      .pipe(
        map(result => result as TeamMember[]),
        take(1)
      );
  }

  updateTeamMembers(members: any) {
    return this.http
      .put(`${this.baseUrl}/members`, members)
      .pipe(
        map(result => result as TeamMember[]),
        take(1)
      );
  }
}