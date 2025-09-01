import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { VersionService } from "@features/projects/services/version.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { TooltipModule } from "primeng/tooltip";
import { TextareaModule } from 'primeng/textarea';
import { Version } from "@features/projects/models/version";
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from "primeng/inputmask";
import { InputNumberModule } from "primeng/inputnumber";
import { environment } from "environments/environment";

@Component({
  selector: 'version-edit',
  standalone: true,
  templateUrl: './version-edit.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    FloatLabelModule,
    InputMaskModule,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    TextareaModule,
    TooltipModule,
    FileUploadModule
  ], 
  providers: [
    VersionService
  ]
})
export class VersionEdit implements OnInit, OnDestroy {
  isUpdate = false;
  projectId = 0;
  lastVersion = '';
  version?: Version;
  form!: FormGroup;
  success = false;
  fileUpload?: File;
  fileName?: string;
  fileUrl?: string;

  constructor(
    config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private versionService: VersionService
  ) {
    if(config.data?.projectId){
      this.projectId = config.data?.projectId as number;
    }

    if(config.data?.lastVersion){
      this.lastVersion = config.data?.lastVersion as string;
    }

    if(config.data?.version){
      this.version = config.data.version as Version;
      this.fileUrl = this.version.fileUrl;
      this.fileName = this.version.fileName;
      this.isUpdate = true;
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.disposeFile();
  }

  disposeFile() {
    // disposing temp file
    if(this.fileUrl){
      URL.revokeObjectURL(this.fileUrl);
      this.fileUpload = undefined;
    }
  }

  initForm() {
    let numberSplit = ['0', '0', '0'];
    if(this.version?.number){
      numberSplit = this.version.number.split('.');
    }
    this.form = new FormGroup({
      id: new FormControl(this.version?.id ?? 0),
      projectId: new FormControl(this.projectId),
      number: new FormControl(this.version?.number),
      lastVersion: new FormControl(this.lastVersion),
      major: new FormControl(numberSplit[0], [Validators.required, Validators.minLength(1), Validators.maxLength(3)]),
      minor: new FormControl(numberSplit[1], [Validators.required, Validators.minLength(1), Validators.maxLength(3)]),
      build: new FormControl(numberSplit[2], [Validators.required, Validators.minLength(1), Validators.maxLength(3)]),
      note: new FormControl(this.version?.note, [Validators.maxLength(1000)]),
      file: new FormControl(this.version?.fileName, [Validators.required])
    });
  }

  validateField(field: string) {
    const formField = this.form.get(field);
    return formField?.errors && formField?.touched;
  }

  notesLength(): number {
    return this.form.get('note')?.value?.length ?? 0;
  }

  onUpload(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    if(element.files){
      this.fileUpload = element.files[0];
      this.form.get('file')?.setValue(this.fileUpload.name);
      this.fileName = this.fileUpload.name;
      
      this.fileUrl = URL.createObjectURL(this.fileUpload);
    }
  }

  formatVersion() {
    return (
      (this.form.get('major')?.value ?? 0) + '.' +
      (this.form.get('minor')?.value ?? 0) + '.' +
      (this.form.get('build')?.value ?? 0)
    ) as string;
  }

  validateVersion() {
    if(!this.form.valid) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Preencha todos os campos corretamente.'
      });
      return false;
    }

    this.form.get('number')?.setValue(
      this.formatVersion()
    );

    this.version = {
      ...this.form.value,
      file: this.fileUpload
    } as Version;

    let lastVersionNbr = parseInt(this.version.lastVersion?.replace('.', '') ?? '0');
    let actualVersionNbr = parseInt(this.version.number?.replace('.', '') ?? '0');

    if(actualVersionNbr == 0) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'A nova versão precisa ser maior que zero.'
      });
      return false;
    }

    if(actualVersionNbr < lastVersionNbr) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'A nova versão precisa ser maior que a versão anterior.'
      });
      return false;
    }

    if(actualVersionNbr == lastVersionNbr) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção!',
        detail: 'Já existe este número de versão.'
      });
      return false;
    }

    return true;
  }

  save() {
    if(!this.validateVersion()) {
      return;
    }

    this.spinner.show();

    const observer = this.isUpdate
    ? this.versionService.updateVersion(this.version!)
    : this.versionService.createVersion(this.version!);

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
          detail: err.error.message ?? 'Não foi possivel salvar a versão. Tente novamente mais tarde.'
        });
        console.error(err);
      }
    })
    .add(() => {
      this.spinner.hide();

      if(this.success){
        this.disposeFile();
        this.ref.close(this.success);
      }
    });
  }

  filesAccepted() {
    return environment.acceptedExtensions.join(',')
  }
}