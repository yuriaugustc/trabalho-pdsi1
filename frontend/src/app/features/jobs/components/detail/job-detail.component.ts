import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { TooltipModule } from "primeng/tooltip";
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from "primeng/inputmask";
import { InputNumberModule } from "primeng/inputnumber";
import { environment } from "environments/environment";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'job-detail',
  standalone: true,
  templateUrl: './job-detail.component.html',
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
  ]
})
export class JobDetail implements OnInit {
  jobId: number = 0;
  job: any;

  constructor(
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));

    // TODO
    // getRoute by Id
    // from mock? how?
    // get all list on service and filter by id?
  }
}