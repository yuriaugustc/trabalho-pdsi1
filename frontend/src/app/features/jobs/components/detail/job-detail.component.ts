import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { FloatLabelModule } from "primeng/floatlabel";
import { TooltipModule } from "primeng/tooltip";
import { ActivatedRoute, Router } from "@angular/router";
import { JobService } from "@features/jobs/services/job.service";
import { Job } from "@features/jobs/models/job";
import { TagModule } from "primeng/tag";
import { SkeletonModule } from "primeng/skeleton";
import { SanitizerPipe } from "@core/pipes/html-sanitizier.pipe";

@Component({
  selector: 'job-detail',
  standalone: true,
  templateUrl: './job-detail.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    FloatLabelModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
    SanitizerPipe
], 
  providers: [
    JobService
  ]
})
export class JobDetail implements OnInit {
  jobId: number = 0;
  from: string = 'list';
  job!: Job;
  userApplied: boolean = false;
  userSaved: boolean = false;

  constructor(
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private service: JobService,
  ) { }

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
    this.route.queryParamMap.subscribe(params => {
      this.from = params.get('from') ?? 'list';
    });

    this.service
      .loadJobByIdMock(this.jobId)
      .subscribe({
        next: (data) => {
          this.job = data;
          this.userApplied = this.service.jobApplied(this.jobId);
        },
        error: (err) => {
          this.toast.add({
            severity: 'error',
            summary: 'Erro ao carregar os dados',
            detail: 'Houve um erro inesperado, tente novamente em breve.'
          });
          console.error(err);
        }
      });
  }

  voltar() {
    switch (this.from) {
      case 'applied':
        this.router.navigate(['/applies']);
        break;
      case 'saved':
        this.router.navigate(['/saved']);
        break;
      default:
        this.router.navigate(['/jobs']);
    }
  }

  applyJob() {
    this.userApplied = !this.userApplied;
    this.toast.add({
      severity: 'info',
      summary: this.userApplied ? 'Candidatado à vaga' : 'Candidatura removida',
    });

    if(this.userApplied) {
      this.service.saveJobApplied(this.job);
    } else {
      this.service.removeJobApplied(this.jobId);
    }
  }

  saveJob() {
    this.userSaved = !this.userSaved;
    this.toast.add({
      severity: 'info',
      summary: this.userSaved ? 'Vaga salva' : 'Removida das vagas salvas',
    });

    if(this.userSaved) {
      this.service.saveJobSaved(this.job);
    } else {
      this.service.removeJobSaved(this.jobId);
    }
  }
}