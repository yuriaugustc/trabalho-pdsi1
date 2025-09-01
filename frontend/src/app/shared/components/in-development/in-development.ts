import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule, ButtonModule],
    template: `
        <div class="flex h-full justify-items-center items-center overflow-hidden">
            <div class="flex w-full flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                        <span class="text-primary font-bold text-3xl">
                            <img src="assets/images/empregUFU.png" alt="Logo" width="50" />
                        </span>
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-2xl lg:text-3xl mb-2">Pagina em desenvolvimento</h1>
                        <div class="text-surface-600 dark:text-surface-200 mb-8">Em breve novidades!</div>
                        <p-button label="Voltar a página principal" routerLink="/home" />
                    </div>
                </div>
            </div>
        </div>`
})
export class InDevelopment { }
