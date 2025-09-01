import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Access } from "@core/enums/access";
import { Team } from "@features/teams/models/team";
import { TeamFilter } from "@features/teams/models/team-filter";
import { TeamService } from "@features/teams/services/team.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService, ConfirmationService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogService } from "primeng/dynamicdialog";
import { SkeletonModule } from "primeng/skeleton";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { TeamEdit } from "../edit/teams-edit.component";
import { TeamMembers } from "../members/teams-members.component";

@Component({
  selector: 'teams-list',
  standalone: true,
  templateUrl: './teams-list.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule
  ],
  providers: [
    DialogService,
    TeamService
  ]
})
export class TeamsList {
  teams: Team[] = [];
  skeleton = Array.from({ length: 1 }).map(() => ({} as Team));
  requestReturned = false;
  lastConfig?: TableLazyLoadEvent;
  @ViewChild('dt') dt!: Table;
  
  constructor(
    private toast: MessageService,
    private dialog: DialogService,
    private confirmationService: ConfirmationService,
    private teamService: TeamService,
    private spinner: NgxSpinnerService
  ) { }

  loadTeamsLazy(event: TableLazyLoadEvent) {
    this.spinner.show();

    this.lastConfig = event;

    this.teamService
      .loadTeams(
        this.makeFilterObj(event)
      )
      .subscribe({
        next: (data: Team[]) => {
          this.teams = data;
        },
        error: (err) => {
          this.toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possivel buscar as equipes. Tente novamente mais tarde.'
          });
          console.error(err);
        }
      })
      .add(() => {
        this.requestReturned = true;
        this.spinner.hide();
      });
  }

  createTeam() {
    this.dialog.open(
      TeamEdit, 
      {
        header: 'Criar equipe',
        width: '35vw',
        modal: true,
        draggable: true,
        focusOnShow: false,
        closable: true,
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      }
    )
    .onClose.subscribe((result) => {
      if(result){
        this.loadTeamsLazy(this.lastConfig!);
      }
    });
  }

  listTeamMembers(id: number) {
    this.dialog.open(TeamMembers, {
      header: 'Editar membros',
      width: '35vw',
      modal: true,
      draggable: true,
      focusOnShow: false,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      data: {
        teamId: id
      }
    });
  }

  updateTeam(team: Team) {
    this.dialog.open(TeamEdit, {
      header: 'Editar equipe',
      width: '35vw',
      modal: true,
      draggable: true,
      focusOnShow: false,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      data: {
        team
      }
    })
    .onClose.subscribe((result) => {
      if(result){
        this.loadTeamsLazy(this.lastConfig!);
      }
    });
  }

  deleteTeam(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja realmente deletar essa equipe?',
      header: 'Deletar equipe',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirmar',
        severity: 'danger'
      },
      accept: () => {
        this.spinner.show();
        this.teamService.deleteTeam(id)
          .subscribe({
            next: (result) => {
              this.toast.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Equipe deletada.'
              });
              this.loadTeamsLazy(this.lastConfig!);
            },
            error: (err) => {
              this.toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possivel deletar a equipe. Tente novamente mais tarde.'
              });
              console.error(err);
            }
          })
          .add(() => this.spinner.hide());
      }
    });
  }

  makeFilterObj(event: TableLazyLoadEvent) {
    let filters = event.filters as any;
    return {
      limit: event.rows,
      offset: event.first,
      sort: event.sortOrder,
      sortField: event.sortField ?? 'name',
      name: filters?.name?.value ?? '',
      description: filters?.description?.value ?? '',
      leaderName: filters?.leaderName?.value ?? ''
    } as TeamFilter;
  }
}