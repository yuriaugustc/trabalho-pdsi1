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
import { AuthService } from "@shared/services/auth.service";
import { JobStatus } from "@core/enums/job-status";

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
  userId: number = 0;
  from: string = 'list';
  job!: Job;
  userApplied: boolean = false;
  userSaved: boolean = false;

  jobStatus = JobStatus;

  constructor(
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private service: JobService,
    autService: AuthService
  ) { 
    this.userId = autService.loggedUser!.id!;
  }

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
    this.route.queryParamMap.subscribe(params => {
      this.from = params.get('from') ?? 'list';
    });

    this.service
      .loadJobByIdMock(this.jobId)
      .subscribe({
        next: async (data) => {
          this.job = data;
          this.userApplied = await this.service.jobApplied(this.jobId, this.userId);
          this.userSaved = await this.service.jobSaved(this.jobId, this.userId);
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
      case 'company-jobs':
        this.router.navigate(['/company/jobs']);
        break;
      default:
        this.router.navigate(['/jobs']);
    }
  }

  toggleStatus() {
    this.job.status = this.job.status == JobStatus.Open ? JobStatus.Closed : JobStatus.Open;

    this.toast.add({
      severity: 'info',
      summary: this.job.status == JobStatus.Closed ? 'Vaga encerrada' : 'Vaga reaberta',
    });
    
    this.service.updateJob(this.jobId, { status: this.job.status });
  }

  applyJob() {
    this.userApplied = !this.userApplied;
    this.toast.add({
      severity: 'info',
      summary: this.userApplied ? 'Candidatado à vaga' : 'Candidatura removida',
    });
    
    if(this.userApplied) {
      this.service.saveJobApplied(this.jobId, this.userId);
      const appliesCount = this.job.appliesCount + 1;
      this.service.updateJob(this.jobId, { appliesCount });
    } else {
      this.service.removeJobApplied(this.jobId, this.userId);
      const appliesCount = this.job.appliesCount - 1;
      this.service.updateJob(this.jobId, { appliesCount });
    }
  }

  saveJob() {
    this.userSaved = !this.userSaved;
    this.toast.add({
      severity: 'info',
      summary: this.userSaved ? 'Vaga salva' : 'Removida das vagas salvas',
    });

    if(this.userSaved) {
      this.service.saveJobSaved(this.jobId, this.userId);
    } else {
      this.service.removeJobSaved(this.jobId, this.userId);
    }
  }
}