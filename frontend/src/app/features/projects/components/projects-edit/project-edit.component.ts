import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { Project } from "@features/projects/models/project";
import { ProjectService } from "@features/projects/services/project.service";
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
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: 'project-edit',
  standalone: true,
  templateUrl: './project-edit.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    FloatLabelModule,
    InputMaskModule,
    InputTextModule,
    ReactiveFormsModule,
    TooltipModule,
    SelectModule,
    MultiSelectModule
  ],
  providers: [
    ProjectService,
    UserService
  ]
})
export class ProjectEdit implements OnInit {
  project?: Project;
  form!: FormGroup;
  users: User[] = [];
  success = false;

  constructor(
    config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private userService: UserService,
    private projectService: ProjectService
  ) {
    if(config.data?.project){
      this.project = config.data.project as Project;
    }
  }

  ngOnInit(): void {
    this.loadUsersLazy();
    this.initForm();
  }

  initForm() {
    this.form = new FormGroup({
      id: new FormControl(this.project?.id ?? 0),
      name: new FormControl(this.project?.name, [Validators.required, Validators.minLength(8), Validators.maxLength(255)]),
      description: new FormControl(this.project?.description, [Validators.maxLength(500)]),
      responsibleId: new FormControl(this.project?.responsibleId)
    });
  }

  validateField(field: string) {
    const formField = this.form.get(field);
    return formField?.errors && formField?.touched;
  }

  save() {
    if(!this.form.valid) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Preencha todos os campos corretamente.'
      });
      return;
    }

    this.spinner.show();

    this.project = this.form.value as Project;

    const observer = this.project.id! > 0
      ? this.projectService.updateProject(this.project)
      : this.projectService.createProject(this.project);

    observer.subscribe({
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
          detail: 'Não foi possivel salvar o aplicativo. Tente novamente mais tarde.'
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
}