import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { VersionFilter } from "@features/projects/models/version-filter";
import { Version } from "@features/projects/models/version";
import { VersionService } from "@features/projects/services/version.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService, ConfirmationService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { SkeletonModule } from "primeng/skeleton";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { DrawerModule } from "primeng/drawer";
import { VersionEdit } from "../version-edit/version-edit.component";

@Component({
  selector: 'version-list',
  standalone: true,
  templateUrl: './version-list.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    DrawerModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule
  ],
  providers: [
    DialogService,
    VersionService,
  ]
})
export class VersionList {
  openInModal = false;
  projectId: number = 0;
  lastVersion: string = '';
  versions: Version[] = [];
  skeleton = Array.from({ length: 1 }).map(() => ({} as Version));
  requestReturned = false;
  lastConfig?: TableLazyLoadEvent;
  @ViewChild('dt') dt!: Table;

  notePreview = false;
  noteHeader:string = '';
  noteBody:string = '';

  constructor(
    private toast: MessageService,
    private dialog: DialogService,
    private confirmationService: ConfirmationService,
    private versionService: VersionService,
    private spinner: NgxSpinnerService,
    config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
  ) { 
    if(config.data?.projectId){
      this.projectId = config.data.projectId as number;
    }
    if(config.data?.lastVersion){
      this.lastVersion = config.data.lastVersion as string;
    }
    if(config.data?.openInModal){
      this.openInModal = config.data.openInModal as boolean;
    }
  }

  loadVersionsLazy(event: TableLazyLoadEvent) {
    if(!this.projectId) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Projeto não informado para buscar suas versões.'
      });
      this.requestReturned = true;
      return;
    }
    
    this.spinner.show();

    this.lastConfig = event;

    this.versionService
      .loadVersions(
        this.projectId,
        this.makeFilterObj(event)
      )
      .subscribe({
        next: (data: Version[]) => {
          this.versions = data;
          this.versions.map(v => {
            v.fileName = 
              v.fileUrl?.split('/').pop()?.toLocaleLowerCase();
          });
        },
        error: (err) => {
          this.toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possivel buscar as versões do aplicativo. Tente novamente mais tarde.'
          });
          console.error(err);
        }
      })
      .add(() => {
        this.requestReturned = true;
        this.spinner.hide();
      });
  }

  createVersion() {
    this.dialog.open(
      VersionEdit, 
      {
        header: 'Adicionar Versão',
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
          projectId: this.projectId,
          lastVersion: this.lastVersion
        }
      }
    )
    .onClose.subscribe((result) => {
      if(result){
        this.loadVersionsLazy(this.lastConfig!);
      }
    });
  }

  updateVersion(version: Version) {
    this.dialog.open(VersionEdit, {
      header: 'Editar versão',
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
        version,
        projectId: this.projectId,
        lastVersion: this.lastVersion
      }
    })
    .onClose.subscribe((result) => {
      if(result){
        this.loadVersionsLazy(this.lastConfig!);
      }
    });
  }

  deleteVersion(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja realmente deletar essa versão?',
      header: 'Deletar versão',
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
        this.versionService.deleteVersion(id)
          .subscribe({
            next: (result) => {
              this.toast.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Versão deletada.'
              });
              this.loadVersionsLazy(this.lastConfig!);
            },
            error: (err) => {
              this.toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possivel deletar a versão. Tente novamente mais tarde.'
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
      number: filters?.number?.value ?? ''
    } as VersionFilter;
  }

  openNotes(version: Version) {
    this.noteHeader = `Notas de Versão (${version.number}):`;
    this.noteBody = version.note ?? '';
    this.notePreview = true;
  }

  clearPreview() {
    this.noteHeader = '';
    this.noteBody = '';
  }
}