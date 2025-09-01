import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Team } from "@features/teams/models/team";
import { TeamMember } from "@features/teams/models/team-member";
import { TeamService } from "@features/teams/services/team.service";
import { User } from "@shared/models/user";
import { UserService } from "@features/users/services/user.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { SelectModule } from "primeng/select";
import { SkeletonModule } from "primeng/skeleton";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: 'teams-members',
  standalone: true,
  templateUrl: './teams-members.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    FloatLabelModule,
    FormsModule,
    InputMaskModule,
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    SelectModule,
    SkeletonModule,
    MultiSelectModule
  ], 
  providers: [
    TeamService,
    UserService
  ]
})
export class TeamMembers implements OnInit {
  teamId: number = 0;
  success = false;
  requestReturned = false;
  skeleton = Array.from({ length: 1 }).map(() => ({} as TeamMember));
  lastConfig?: TableLazyLoadEvent;
  @ViewChild('dt') dt!: Table;
  users: User[] = [];
  usersSelected: number[] = [];
  members: TeamMember[] = [];

  constructor(
    config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private teamService: TeamService,
    private userService: UserService
  ) { 
    if(config.data?.teamId) {
      this.teamId = config.data.teamId as number;
    }
  }

  ngOnInit(): void {
    this.loadUsersLazy();
    this.loadMembersLazy();
  }

  addMember() {
    if(this.usersSelected.length <= 0){
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Selecione um usuário antes.'
      });
      return;
    }

    const idsAlreadyIn = this.members.map(m => m.userId);
    
    let userAlreadyIn = 
      this.usersSelected.some(id => idsAlreadyIn.includes(id));

    if(userAlreadyIn) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Um ou mais dos usuários selecionados já está na equipe, os mesmos serão ignorados.'
      });
    }

    this.usersSelected = 
      this.usersSelected.filter(id => !idsAlreadyIn.includes(id));

    for(let u of this.usersSelected) {
      let user = this.users.find(us => us.id == u);

      this.members.push({
        id: 0,
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        teamId: this.teamId
      } as TeamMember);
    }
    this.usersSelected = [];
  }

  save() {
    this.teamService
      .updateTeamMembers({
        teamId: this.teamId,
        members: this.members.map(m => m.userId)
      })
      .subscribe({
        next: (result) => {
          this.success = true;
          this.toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Registro salvo com sucesso!'
          });
        },
        error: (err) => {
          this.toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.error.message ?? 'Não foi possivel salvar a equipe. Tente novamente mais tarde.'
          });
          console.error(err);
        }
      })
      .add(() => {
        this.spinner.hide();

        if(this.success) {
          this.ref.close(this.success);
        }
      });
  }

  loadUsersLazy() {
    this.spinner.show();

    this.userService
    .loadUsersAll()
    .subscribe({
        next: (data: User[]) => {
          this.users = data;
        },
        error: (err) => {
          this.toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possivel buscar os usuários. Tente novamente mais tarde.'
          });
          console.error(err);
        }
      })
      .add(() => {
        this.spinner.hide();
      });
  }

  loadMembersLazy() {
    this.spinner.show();

    this.teamService
    .getTeamMembers(this.teamId)
    .subscribe({
        next: (data: TeamMember[]) => {
          this.members = data;
        },
        error: (err) => {
          this.toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possivel buscar os membros da equipe. Tente novamente mais tarde.'
          });
          console.error(err);
        }
      })
      .add(() => {
        this.requestReturned = true;
        this.spinner.hide();
      });
  }

  removeMember(event: Event, id: number) {
    this.members = this.members.filter(u => u.userId != id);
  }
}