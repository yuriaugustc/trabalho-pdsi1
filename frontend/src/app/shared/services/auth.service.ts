import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Access } from '@core/enums/access';
import { User } from '@shared/models/user';
import { environment } from 'environments/environment';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import Dexie, { Table } from 'dexie';
import { Role } from '@core/enums/role';

@Injectable({ providedIn: 'root' })
export class AuthService extends Dexie {
	loggedUser?: User;
	users!: Table<User, number>;
	private $logged = new BehaviorSubject<boolean>(false);
	private baseUrl = `${environment.apiUrl}/auth`;

	constructor(
		private http: HttpClient,
		private jwtHelperService: JwtHelperService,
		private toast: MessageService
	) {
		super(environment.localDbName); // nome do banco
    this.version(1)
			.stores({
      	users: '++id,nome,email' // índice por id e nome/email
    	});

		this.addUsers();
	}

	getUserByEmail(email: string) {
    return this.users.where('email').equals(email).first();
  }

	login(user: User) {
		return this.http
			.post(`${this.baseUrl}/login`, user)
			.pipe(
				tap((data: any) => {
					this.setAccessToken(data.token as string);
				}),
				map((data) => (data.token as string) != ''),
				take(1)
			);
	}

	refreshToken() {
		return this.http
			.post(`${this.baseUrl}/refresh`, { })
			.pipe(
				tap((response: any) => {
					this.setAccessToken(response.token as string);
				})
			);
	}

	setAccessToken(token: string) {
		sessionStorage.setItem(environment.jwtSessionKey, token);

		const tokenExpiration = this.jwtHelperService.getTokenExpirationDate(token)!;
		const timeoutMs = tokenExpiration.getTime() - Date.now();

		// expirando o login após o token expirar
		setTimeout(() => {
			this.forceLogout();
		}, timeoutMs);

		this.$logged.next(true);
	}

	forceLogout() {
		this.toast.add({
			severity: 'warn',
			summary: 'Desconectado!',
			detail: 'O tempo de atividade da sua sessão expirou.',
			sticky: true
		});
		this.logout();
	}

	// Limpar o token no logout
	logout(): void {
		sessionStorage.removeItem(environment.jwtSessionKey);
		this.$logged.next(false);
	}

	isLoggedIn() {
		return this.$logged.asObservable();
	}

	isAuthenticated(): boolean {
		const token = sessionStorage.getItem(environment.jwtSessionKey);
		return token ? !this.jwtHelperService.isTokenExpired(token) : false;
	}

	// Obter a data de expiração do token
	async getTokenExpirationDate(): Promise<Date | null> {
		const token = await this.jwtHelperService.tokenGetter();
		return token ? this.jwtHelperService.getTokenExpirationDate(token) : null;
	}

	async getAccesses(): Promise<Access[]> {
		const token = await this.jwtHelperService.tokenGetter();
		if(!token) return [];

		return this.jwtHelperService
			.decodeToken<any>(token)
			.accesses as Access[];
	}

	async addUsers() {
		this.users.clear();

		// Students
		this.users.bulkAdd(
			[
				{
					email: 'yuri.augusto000@ufu.br',
					name: 'Yuri Augusto da Costa',
					password: 'teste@123',
					role: Role.Student
				},
				{
					email: 'victor.alves54@ufu.br',
					name: 'Victor Alves Guimarães',
					password: 'teste@123',
					role: Role.Student
				},
				{
					email: 'joao.melo1@ufu.br',
					name: 'João Lucas Nascimento de Melo',
					password: 'teste@123',
					role: Role.Student
				},
				// restante do grupo
			]
		);

		// Companies
		this.users.bulkAdd(
			[
				{
					email: "techsolutions@dominio.com",
					name: "TechSolutions Ltda.",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "datainsights@dominio.com",
					name: "Data Insights S.A.",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "creativeminds@dominio.com",
					name: "Creative Minds Agência",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "globalpartners@dominio.com",
					name: "Global Partners Consultoria",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "inovatech@dominio.com",
					name: "Inovatech Design Studio",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "softwarehub@dominio.com",
					name: "Software Hub",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "connectit@dominio.com",
					name: "ConnectIT Services",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "financorp@dominio.com",
					name: "FinanCorp",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "peoplefirst@dominio.com",
					name: "People First",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "officesolutions@dominio.com",
					name: "Office Solutions",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "enterprisearchitects@dominio.com",
					name: "Enterprise Architects",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "codifytech@dominio.com",
					name: "Codify Tech",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "securenet@dominio.com",
					name: "SecureNet Inc.",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "agileinnovations@dominio.com",
					name: "Agile Innovations",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "cognitiveailab@dominio.com",
					name: "Cognitive AI Lab",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "webcrafters@dominio.com",
					name: "WebCrafters",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "cloudspshere@dominio.com",
					name: "CloudSphere",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "qualityassured@dominio.com",
					name: "Quality Assured",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "salesforceone@dominio.com",
					name: "Sales Force One",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "userinsightsco@dominio.com",
					name: "User Insights Co.",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "appmakers@dominio.com",
					name: "App Makers",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "digitalboost@dominio.com",
					name: "Digital Boost",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "contenthub@dominio.com",
					name: "Content Hub",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "metricssolutions@dominio.com",
					name: "Metrics Solutions",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "cloudops@dominio.com",
					name: "CloudOps",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "aiwizards@dominio.com",
					name: "AI Wizards",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "gamedevstudio@dominio.com",
					name: "GameDev Studio",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "digitalfirst@dominio.com",
					name: "Digital First",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "supplychainpros@dominio.com",
					name: "Supply Chain Pros",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "networksolution@dominio.com",
					name: "Network Solutions",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "enterprisesolutions@dominio.com",
					name: "Enterprise Solutions",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "bpmconsultants@dominio.com",
					name: "BPM Consultants",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "productheroes@dominio.com",
					name: "Product Heroes",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "systechintegrations@dominio.com",
					name: "Systech Integrations",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "robosolutions@dominio.com",
					name: "RoboSolutions",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "dataminers@dominio.com",
					name: "Data Miners",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "socialwave@dominio.com",
					name: "Social Wave",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "automatenow@dominio.com",
					name: "Automate Now",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "appbuilders@dominio.com",
					name: "App Builders",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "financematters@dominio.com",
					name: "Finance Matters",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "codelogic@dominio.com",
					name: "Code Logic",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "architectsguild@dominio.com",
					name: "Architects Guild",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "ecommerceexperts@dominio.com",
					name: "E-commerce Experts",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "gamecraft@dominio.com",
					name: "GameCraft",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "cyberguard@dominio.com",
					name: "CyberGuard",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "brandinnovators@dominio.com",
					name: "Brand Innovators",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "javapros@dominio.com",
					name: "Java Pros",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "customerfirst@dominio.com",
					name: "Customer First",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "projectmasters@dominio.com",
					name: "Project Masters",
					password: "teste@123",
					role: Role.Company
				},
				{
					email: "mobileinnovators@dominio.com",
					name: "Mobile Innovators",
					password: "teste@123",
					role: Role.Company
				}
			]
		);
	}
}
