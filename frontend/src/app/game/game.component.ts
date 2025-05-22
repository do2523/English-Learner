// home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Welcome to Home</h1> `,
})
export class gameComponent {}
