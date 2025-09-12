import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogService } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { SelectModule } from "primeng/select";
import { DataViewModule } from "primeng/dataview";
import { TooltipModule } from "primeng/tooltip";
import { Job } from "@features/jobs/models/job";
import { JobService } from "@features/jobs/services/job.service";
import { TagModule } from "primeng/tag";
import { FloatLabelModule } from "primeng/floatlabel";
import { DatePickerModule } from "primeng/datepicker";
import { FormsModule } from "@angular/forms";
import { JobFilter } from "@features/jobs/models/job-filter";
import { Skill } from "@features/jobs/models/skill";
import { Router } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { User } from "@shared/models/user";

@Component({
  selector: 'company-jobs',
  standalone: true,
  templateUrl: './company-jobs.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    DataViewModule,
    DatePickerModule,
    DialogModule,
    FloatLabelModule,
    InputTextModule,
    TableModule,
    TagModule,
    TooltipModule,
    SelectModule,
    MultiSelectModule,
    FormsModule
],
  providers: [
    DialogService,
    JobService
  ]
})
export class CompanyJobs implements OnInit {
  companyId: number = 0;
  jobs: Job[] = [];
  jobsFiltered: Job[] = [];
  companies: string[] = [];
  categories: string[] = [];
  skills: any[] = [];
  jobFilter!: JobFilter;
  dialogVisible = false;
  usersApplied: User[] = [];

  constructor(
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private jobService: JobService,
    private router: Router,
    authService: AuthService
  ) { 
    this.companyId = authService.loggedUser!.id!;
  }

  ngOnInit(): void {
    this.initFilterJob();
    this.companyJobs();
  }

  initFilterJob() {
    this.jobFilter = this.jobFilter = { 
      companies: [] as string[],
      categories: [] as string[],
      skills: [] as Skill[],
      modality: [] as string[],
      date: undefined
    } as JobFilter;
  }

  filterJobs() {
    this.spinner.show();

    this.jobsFiltered = this.jobs
      .filter( j => 
        (this.jobFilter.companies.length == 0 || this.jobFilter.companies.includes(j.companyName)) &&
        (this.jobFilter.categories.length == 0 || this.jobFilter.categories.includes(j.category)) &&
        (this.jobFilter.skills.length == 0 || this.jobFilter.skills.map(s => s.name).includes(j.companyName)) &&
        (this.jobFilter.modality.length == 0 || this.jobFilter.modality.includes(j.modality)) &&
        (!this.jobFilter.date || (this.jobFilter.date.toLocaleDateString() == j.createdAt.toLocaleDateString()))
      );

    this.saveFilterInCache();

    this.spinner.hide();
  }

  clearFilters() {
    this.spinner.show();

    this.jobsFiltered = this.jobs;
    this.initFilterJob();
    this.saveFilterInCache();

    this.spinner.hide();
  }

  detailJob(id: number) {
    this.router.navigate(['/jobs', id], { queryParams: { from: 'company-jobs' } });
  }

  detailCandidates(id: number) {
    this.spinner.show();
    
    this.jobService.getUsersApplied(id)
      .subscribe((jobs) => {
        const jobUsers = jobs.filter(j => j !== undefined);
        const ids = jobUsers.map(j => j.userId);

        this.jobService.getUsersById(ids)
          .subscribe((users) => {
            this.usersApplied = users.filter(j => j !== undefined);
            this.dialogVisible = true;
          });
      })
      .add(() => this.spinner.hide());
  }

  companyJobs() {
    this.spinner.show();

    this.jobService.getJobsByCompanyId(this.companyId)
      .subscribe((jobs) => {
        this.jobs = jobs.filter(j => j !== undefined);
        this.jobsFiltered = this.jobs;
        this.loadFilterInCache();
    
        this.companies = [...new Set(this.jobs.map(j => j.companyName))];
        this.categories = [...new Set(this.jobs.map(j => j.category))];
        
        let skills = this.jobs.map(j => j.skills);
        let skillsArr: Skill[] = [];
        skills.forEach(s => skillsArr.push(...s));
    
        this.skills = [...new Map(skillsArr.map(s => [s.id, s])).values()];

        this.spinner.hide();
      });
  }

  saveFilterInCache() {
    sessionStorage.setItem(
      'company-job-filter-cache',
      JSON.stringify(this.jobFilter)
    );
  }

  loadFilterInCache() {
    this.initFilterJob();
    let filterInCache = sessionStorage.getItem('company-job-filter-cache');
    let filterObjCache = { 
      ...this.jobFilter
    } as JobFilter;

    if(filterInCache) {
      let aux = JSON.parse(filterInCache);
      filterObjCache = { 
        companies: (aux?.companies ?? []) as string[],
        categories: (aux?.categories ?? []) as string[],
        skills: (aux?.skills ?? []) as Skill[],
        modality: (aux?.modality ?? []) as string[],
        date: aux?.date ?? undefined
      } as JobFilter;
    }

    this.jobFilter = filterObjCache;

    this.filterJobs();
  }
}