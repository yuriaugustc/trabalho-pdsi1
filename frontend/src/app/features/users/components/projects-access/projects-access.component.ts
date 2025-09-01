import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Project } from "@features/projects/models/project";
import { ProjectService } from "@features/projects/services/project.service";
import { TeamMember } from "@features/teams/models/team-member";
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
import { UserProject } from "@features/users/models/user-project";
import { UserService } from "@features/users/services/user.service";

@Component({
  selector: 'projects-access',
  standalone: true,
  templateUrl: './projects-access.component.html',
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
    ProjectService,
    UserService
  ]
})
export class ProjectsAccess implements OnInit {
  userId: number = 0;
  success = false;
  requestReturned = false;
  skeleton = Array.from({ length: 1 }).map(() => ({} as TeamMember));
  lastConfig?: TableLazyLoadEvent;
  @ViewChild('dt') dt!: Table;
  projects: Project[] = [];
  projectsSelected: number[] = [];
  accesses: UserProject[] = [];

  constructor(
    config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private userService: UserService
  ) { 
    if(config.data?.userId) {
      this.userId = config.data.userId as number;
    }
  }

  ngOnInit(): void {
    this.loadProjectsLazy();
    this.loadAccessesLazy();
  }

  addAccess() {
    if(this.projectsSelected.length <= 0){
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Selecione um aplicativo antes.'
      });
      return;
    }

    const idsAlreadyIn = this.accesses.map(m => m.projectId);
    
    let userAlreadyIn = 
      this.projectsSelected.some(id => idsAlreadyIn.includes(id));

    if(userAlreadyIn) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Um ou mais dos aplicativos selecionados já estão liberados, os mesmos serão ignorados.'
      });
    }

    this.projectsSelected = 
      this.projectsSelected.filter(id => !idsAlreadyIn.includes(id));

    for(let p of this.projectsSelected) {
      let project = this.projects.find(us => us.id == p);

      this.accesses.push({
        id: 0,
        userId: this.userId,
        projectId: project?.id,
        projectName: project?.name
      } as UserProject);
    }

    this.projectsSelected = [];
  }

  save() {
    this.userService
      .updateUserAccesses({
        userId: this.userId,
        projects: this.accesses.map(m => m.projectId)
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

        if(this.success){
          this.ref.close(this.success);
        }
      });
  }

  loadProjectsLazy() {
    this.spinner.show();

    this.projectService
    .loadAllProjects()
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
        this.spinner.hide();
      });
  }

  loadAccessesLazy() {
    this.spinner.show();

    this.userService
    .getAccesses(this.userId)
    .subscribe({
        next: (data: UserProject[]) => {
          this.accesses = data;
        },
        error: (err) => {
          this.toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possivel buscar os acessos do usuário. Tente novamente mais tarde.'
          });
          console.error(err);
        }
      })
      .add(() => {
        this.requestReturned = true;
        this.spinner.hide();
      });
  }

  removeAccess(event: Event, id: number) {
    this.accesses = this.accesses.filter(u => u.projectId != id);
  }
}