import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from './material/material.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    ConfirmDialogComponent
  ],
  exports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    ConfirmDialogComponent
  ]
})
export class SharedModule {}
