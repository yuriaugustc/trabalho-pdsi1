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

@Component({
  selector: 'jobs-list',
  standalone: true,
  templateUrl: './jobs-list.component.html',
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    DataViewModule,
    DatePickerModule,
    FloatLabelModule,
    InputTextModule,
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
export class JobsList implements OnInit {
  jobs: Job[] = [];
  jobsFiltered: Job[] = [];
  companies: string[] = [];
  categories: string[] = [];
  skills: any[] = [];
  jobFilter!: JobFilter;

  constructor(
    private toast: MessageService,
    private spinner: NgxSpinnerService,
    private jobService: JobService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initFilterJob();
    this.loadJobs();
    this.loadCompanies();
    this.loadCategories();
    this.loadSkills();
  }

  initFilterJob() {
    this.jobFilter = this.jobFilter = { 
      companies: [] as string[],
      categories: [] as string[],
      skills: [] as Skill[],
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
    this.router.navigate(['/jobs', id]);
  }

  loadJobs() {
    this.spinner.show();

    this.jobService
    .loadJobsMock()
    .subscribe({
      next: (data: Job[]) => {
        this.jobsFiltered = this.jobs = data;
        this.loadFilterInCache();
      },
      error: (err) => {
        this.toast.add({
          severity: 'error',
          summary: 'Erro ao carregar os dados',
          detail: 'Houve um erro inesperado, tente novamente em breve.'
        });
        console.error(err);
      }
    })
    .add(() => {
      this.spinner.hide();
    });
  }

  loadCompanies() {
    this.jobService
    .loadCompaniesMock()
    .subscribe({
      next: (data: string[]) => {
        this.companies = data;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  loadCategories() {
    this.jobService
    .loadCategoriesMock()
    .subscribe({
      next: (data: string[]) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  loadSkills() {
    this.jobService
    .loadSkillsMock()
    .subscribe({
      next: (data: any[]) => {
        this.skills = data;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  saveFilterInCache() {
    sessionStorage.setItem(
      'job-filter-cache',
      JSON.stringify(this.jobFilter)
    );
  }

  loadFilterInCache() {
    this.initFilterJob();
    let filterInCache = sessionStorage.getItem('job-filter-cache');
    let filterObjCache = { 
      ...this.jobFilter
    } as JobFilter;

    if(filterInCache) {
      let aux = JSON.parse(filterInCache);
      filterObjCache = { 
        companies: (aux?.companies ?? []) as string[],
        categories: (aux?.categories ?? []) as string[],
        skills: (aux?.skills ?? []) as Skill[],
        date: aux?.date ?? undefined
      } as JobFilter;
    }

    this.jobFilter = filterObjCache;

    this.filterJobs();
  }
}