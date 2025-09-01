import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Project } from "@features/projects/models/project";
import { ProjectFilter } from "@features/projects/models/project-filter";
import { ProjectService } from "@features/projects/services/project.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogService } from "primeng/dynamicdialog";
import { SkeletonModule } from "primeng/skeleton";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { ProjectEdit } from "../projects-edit/project-edit.component";
import { VersionList } from "../version-list/version-list.component";

@Component({
  selector: 'projects',
  standalone: true,
  templateUrl: './projects-list.component.html',
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
    ProjectService,
  ]
})
export class ProjectsList {
  projects: Project[] = [];
  skeleton = Array.from({ length: 1 }).map(() => ({} as Project));
  requestReturned = false;
  lastConfig?: TableLazyLoadEvent;
  @ViewChild('dt') dt!: Table;
  
  constructor(
    private toast: MessageService,
    private dialog: DialogService,
    private confirmationService: ConfirmationService,
    private projectService: ProjectService,
    private spinner: NgxSpinnerService
  ) { }

  loadProjectsLazy(event: TableLazyLoadEvent) {
    this.spinner.show();

    this.lastConfig = event;

    this.projectService
      .loadProjects(
        this.makeFilterObj(event)
      )
      .subscribe({
        next: (data: Project[]) => {
          this.projects = data;
        },
        error: (err) => {
          this.toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possivel buscar os aplicativos. Tente novamente mais tarde.'
          });
          console.error(err);
        }
      })
      .add(() => {
        this.requestReturned = true;
        this.spinner.hide();
      });
  }

  createProject() {
    this.dialog.open(
      ProjectEdit, 
      {
        header: 'Criar aplicativo',
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
        this.loadProjectsLazy(this.lastConfig!);
      }
    });
  }

  updateProject(project: Project) {
    this.dialog.open(ProjectEdit, {
      header: 'Editar aplicativo',
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
        project
      }
    })
    .onClose.subscribe((result) => {
      if(result){
        this.loadProjectsLazy(this.lastConfig!);
      }
    });
  }

  deleteProject(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja realmente deletar esse aplicativo?',
      header: 'Deletar aplicativo',
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
        this.projectService.deleteProject(id)
          .subscribe({
            next: (result) => {
              this.toast.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Aplicativo deletado.'
              });
              this.loadProjectsLazy(this.lastConfig!);
            },
            error: (err) => {
              this.toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possivel deletar o aplicativo. Tente novamente mais tarde.'
              });
              console.error(err);
            }
          })
          .add(() => this.spinner.hide());
      }
    });
  }

  copyToken(token: string) {
    navigator.clipboard.writeText(token)
    .then(() => {
      this.toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Token copiado para área de transferência.'
      });
    })
    .catch(err => {
      console.error('Erro ao copiar:', err);
      this.toast.add({
        severity: 'error',
        summary: 'Erro!',
        detail: 'Houve um erro ao copiar o token.'
      });
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
      lastVersion: filters?.lastVersion?.value ?? '',
      responsibleName: filters?.responsibleName?.value ?? '',
    } as ProjectFilter;
  }

  listVersions(projectId: number, lastVersion: string) {
    this.dialog.open(VersionList, {
      header: 'Versões do aplicativo',
      width: '50vw',
      modal: true,
      draggable: true,
      focusOnShow: false,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      data: {
        projectId,
        lastVersion,
        openInModal : true
      }
    })
    .onClose.subscribe((result) => {
      if(result){
        this.loadProjectsLazy(this.lastConfig!);
      }
    });
  }
}