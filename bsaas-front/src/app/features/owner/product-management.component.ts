import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent {
  productForm;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private fb: FormBuilder, private productService: ProductService) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', Validators.required],
      stock: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.loading = true;
    this.error = null;
    // Ensure all required fields are present and not null
    const { name, description, price, stock } = this.productForm.value;
    if (!name || !description || !price || !stock) {
      this.loading = false;
      this.error = 'All fields are required.';
      return;
    }
    const product = {
      name: name as string,
      description: description as string,
      price: Number(price),
      stock: Number(stock)
    };
    this.productService.saveProduct(product).subscribe({
      next: (res: { success: boolean }) => {
        this.loading = false;
        if (res.success) {
          this.success = 'Product saved!';
        } else {
          this.error = 'Failed to save product.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.userMessage || 'Error saving product.';
      }
    });
  }
}
