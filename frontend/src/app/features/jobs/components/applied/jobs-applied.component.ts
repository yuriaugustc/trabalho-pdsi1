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
  selector: 'jobs-applied',
  standalone: true,
  templateUrl: './jobs-applied.component.html',
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
export class JobsApplied implements OnInit {
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
    this.loadJobsApplied();
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
    this.router.navigate(['/jobs', id], { queryParams: { from: 'applied' } });
  }

  async loadJobsApplied() {
    this.spinner.show();

    this.jobs = await this.jobService.getAppliedJobs();
    this.jobsFiltered = this.jobs;
    this.loadFilterInCache();

    this.companies = [...new Set(this.jobs.map(j => j.companyName))];
    this.categories = [...new Set(this.jobs.map(j => j.category))];
    
    let skills = this.jobs.map(j => j.skills);
    let skillsArr: Skill[] = [];
    skills.forEach(s => skillsArr.push(...s));

    this.skills = [...new Map(skillsArr.map(s => [s.id, s])).values()];
  }

  saveFilterInCache() {
    sessionStorage.setItem(
      'applied-job-filter-cache',
      JSON.stringify(this.jobFilter)
    );
  }

  loadFilterInCache() {
    this.initFilterJob();
    let filterInCache = sessionStorage.getItem('applied-job-filter-cache');
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