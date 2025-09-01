import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { User } from "@shared/models/user";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { InputMaskModule } from 'primeng/inputmask';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Button, ButtonModule } from "primeng/button";
import { CommonModule } from "@angular/common";
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { Role } from "@core/enums/role";
import { Access } from "@core/enums/access";
import { MessageService } from "primeng/api";
import { UserService } from "@features/users/services/user.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Password, PasswordModule } from 'primeng/password';
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: 'user-edit',
  standalone: true,
  templateUrl: './user-edit.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    DividerModule,
    FloatLabelModule,
    InputMaskModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule,
    TooltipModule,
    SelectModule,
    MultiSelectModule
  ],
  providers: [
    UserService
  ]
})
export class UserEdit implements OnInit {
  user?: User;
  success = false;
  form!: FormGroup;
  roles: any[] = [];
  accesses: any[] = [];

  constructor(
    config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private userService: UserService
  ) {
    if(config.data?.user){
      this.user = config.data.user as User;
    }
  }

  ngOnInit(): void {
    this.initRoles();
    this.initAccesses();
    this.initForm();
  }

  initRoles() {
    this.roles = [
      { label: 'Usuário', value: Role.USER },
      { label: 'Desenvolvedor', value: Role.DEV },
      { label: 'Desenvolvedor Líder', value: Role.LEAD },
      { label: 'Admin', value: Role.ADMIN },
    ];
  }

  initAccesses() {
    this.accesses = [
      { label: 'Usuários', value: Access.USERS },
      { label: 'Aplicativos', value: Access.PROJECTS },
      { label: 'Equipes', value: Access.TEAMS },
    ];
  }

  initForm() {
    this.form = new FormGroup({
      id: new FormControl(this.user?.id ?? 0),
      name: new FormControl(this.user?.name, [Validators.required, Validators.minLength(8)]),
      email: new FormControl(this.user?.email, [Validators.required, Validators.email]),
      password: new FormControl(''),
      role: new FormControl(this.user?.role, [Validators.required]),
      accesses: new FormControl(this.user?.accesses, [Validators.required])
    });
  }

  validateField(field: string) {
    const formField = this.form.get(field);
    return formField?.errors && formField?.touched;
  }

  validatePassword() {
    // em casos de update a senha não é obrigatória
    const password = this.form.get('password')?.value as string;
    const id = this.form.get('id')?.value as number;
    return id <= 0 && (password == '' || password.length < 8);
  }

  save() {
    if(this.validatePassword() || !this.form.valid) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Preencha todos os campos corretamente.'
      });
      return;
    }

    this.spinner.show();

    this.user = this.form.value as User;

    const observer = this.user.id! <= 0
      ? this.userService.createUser(this.user)
      : this.userService.updateUser(this.user);

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
          detail: err.error.message || 'Não foi possivel salvar o usuário. Tente novamente mais tarde.'
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

  generatePassword() {
    this.form.get('password')?.setValue(
      this.generateStrongPassword()
    );
  }

  mediumRegex() {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`])(.{8,})$/.source;
  }

  strongRegex() {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`])(.{12,})$/.source;
  }

  generateStrongPassword() {
    const letrasMaiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letrasMinusculas = "abcdefghijklmnopqrstuvwxyz";
    const numeros = "0123456789";
    const especiais = "!@#$%^&*()-_=+[]{};:,.<>?";

    // Garantir pelo menos um de cada tipo
    const aleatorios = [
      letrasMaiusculas[Math.floor(Math.random() * letrasMaiusculas.length)],
      letrasMinusculas[Math.floor(Math.random() * letrasMinusculas.length)],
      numeros[Math.floor(Math.random() * numeros.length)],
      especiais[Math.floor(Math.random() * especiais.length)],
    ];

    // Preencher o restante com caracteres aleatórios de todos os grupos
    const todosCaracteres = letrasMaiusculas + letrasMinusculas + numeros + especiais;
    while (aleatorios.length < 12) {
      aleatorios.push(todosCaracteres[Math.floor(Math.random() * todosCaracteres.length)]);
    }

    // Embaralhar os caracteres para não ficar previsível
    for (let i = aleatorios.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [aleatorios[i], aleatorios[j]] = [aleatorios[j], aleatorios[i]];
    }

    return aleatorios.join('');
  }
}