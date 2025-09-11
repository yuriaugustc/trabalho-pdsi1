import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "app/shared/services/auth.service";
import { MessageService } from "primeng/api";
import { User } from "@shared/models/user";
import { CommonModule } from "@angular/common";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class Login implements OnInit {
  form!: FormGroup;

  constructor(
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();  
    this.verifyToken();
  }

  initForm() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  verifyToken() {
    if(this.authService.isAuthenticated()) {
      this.toast.add({
        severity: 'success',
        summary: 'Olá!',
        detail: 'Bem vindo novamente.'
      });
      this.router.navigate(['/home']);
    }
  }

  async login() {
    if(!this.form.valid){
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Preencha corretamente todos os campos.'
      });
      return;
    }
    let user = this.form.value as User;
    
    this.spinner.show();

    const userDb = await this.authService.getUserByEmail(user.email!);

    if(!userDb) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Usuário não encontrado.'
      });
      this.spinner.hide();
      return;
    }

    if(user.password != userDb.password) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Senha incorreta.'
      });
      this.spinner.hide();
      return;
    }

    this.authService.loggedUser = userDb;
    this.router.navigate(['/home']);

    this.toast.add({
      severity: 'success',
      summary: 'Olá!',
      detail: 'Bem vindo.'
    });
  }

  validateError(controlName: string) {
    let control = this.form.get(controlName);

    return control?.touched && control?.errors;
  }
}