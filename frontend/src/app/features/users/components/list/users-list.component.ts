import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { User } from "@shared/models/user";
import { UserService } from "@features/users/services/user.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogService } from 'primeng/dynamicdialog';
import { UserEdit } from "../edit/user-edit.component";
import { Access } from "@core/enums/access";
import { TooltipModule } from "primeng/tooltip";
import { SkeletonModule } from "primeng/skeleton";
import { UserFilter } from "@features/users/models/user-filter";
import { ProjectsAccess } from "../projects-access/projects-access.component";

@Component({
  selector: 'users',
  standalone: true,
  templateUrl: './users-list.component.html',
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
    UserService,
  ]
})
export class UsersList {
  users: User[] = [];
  skeleton = Array.from({ length: 1 }).map(() => ({} as User));
  requestReturned = false;
  lastConfig?: TableLazyLoadEvent;
  @ViewChild('dt') dt!: Table;
  
  constructor(
    private toast: MessageService,
    private dialog: DialogService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private spinner: NgxSpinnerService
  ) { }

  getName(id: number) {
    switch(id) {
      case Access.USERS: return 'Usuários';
      case Access.PROJECTS: return 'Aplicativos';
      case Access.TEAMS: return 'Equipes';
      default: return '';
    }
  }

  loadUsersLazy(event: TableLazyLoadEvent) {
    this.spinner.show();

    this.lastConfig = event;

    this.userService
      .loadUsers(
        this.makeFilterObj(event)
      )
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
        this.requestReturned = true;
        this.spinner.hide();
      });
  }

  userAcess(user: User) {
    this.dialog.open(ProjectsAccess, {
      header: 'Editar acessos',
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
        userId: user.id
      }
    });
  }

  createUser() {
    this.dialog.open(
      UserEdit, 
      {
        header: 'Criar usuário',
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
        this.loadUsersLazy(this.lastConfig!);
      }
    });
  }

  updateUser(user: User) {
    this.dialog.open(UserEdit, {
      header: 'Editar usuário',
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
        user
      }
    })
    .onClose.subscribe((result) => {
      if(result){
        this.loadUsersLazy(this.lastConfig!);
      }
    });
  }

  deleteUser(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja realmente deletar esse usuário?',
      header: 'Deletar usuário',
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
        this.userService.deleteUser(id)
          .subscribe({
            next: (result) => {
              this.toast.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Usuário deletado.'
              });
              this.loadUsersLazy(this.lastConfig!);
            },
            error: (err) => {
              this.toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possivel deletar o usuário. Tente novamente mais tarde.'
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
      email: filters?.email?.value ?? ''
    } as UserFilter;
  }
}