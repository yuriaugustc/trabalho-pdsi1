import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Team } from "@features/teams/models/team";
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
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: 'teams-edit',
  standalone: true,
  templateUrl: './teams-edit.component.html',
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
    TeamService,
    UserService
  ]
})
export class TeamEdit implements OnInit {
  team?: Team;
  success = false;
  form!: FormGroup;
  users: User[] = [];

  constructor(
    config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private teamService: TeamService,
    private userService: UserService
  ) { 
    if(config.data?.team) {
      this.team = config.data.team as Team;
    }
  }

  ngOnInit(): void {
    this.loadUsersLazy();
    this.initForm();
  }

  initForm() {
    this.form = new FormGroup({
      id: new FormControl(this.team?.id ?? 0),
      name: new FormControl(this.team?.name, [Validators.required, Validators.minLength(5), Validators.maxLength(255)]),
      description: new FormControl(this.team?.description, [Validators.maxLength(500)]),
      leaderId: new FormControl(this.team?.leaderId),
      members: new FormControl(this.team?.members),
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

    this.team = this.form.value as Team;

    const observer = this.team.id! <= 0
      ? this.teamService.createTeam(this.team)
      : this.teamService.updateTeam(this.team);

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
}