import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatIconModule, TranslateModule],
  exports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatIconModule, TranslateModule],
})
export class SharedModule {}
