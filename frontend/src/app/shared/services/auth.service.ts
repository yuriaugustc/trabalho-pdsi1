import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '@shared/models/user';
import { environment } from 'environments/environment';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import Dexie, { Table } from 'dexie';

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
}
