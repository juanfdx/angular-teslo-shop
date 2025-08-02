import { Component, inject, input, OnInit } from '@angular/core';
import type { Product } from '@products/interfaces/product.interface';
import { ProductSlider } from "@products/components/product-slider/product-slider";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabel } from "@shared/components/form-error-label/form-error-label";
import { ProductsService } from '@products/services/products.service';


@Component({
  selector: 'product-details',
  imports: [ProductSlider, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})

export class ProductDetails implements OnInit {

  productService = inject(ProductsService);

  product = input.required<Product>();
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  fb = inject(FormBuilder);

  productForm = this.fb.group({
    title : ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    slug  : ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    price : [0, [Validators.required, Validators.min(0)]],
    stock : [0, [Validators.required, Validators.min(0)]],
    sizes : [['']], // if [''] it makes this is a string array
    gender: ['men', [Validators.required, Validators.pattern('^(men|women|kid|unisex)$')]],
    tags  : ['', [Validators.required]],
    images: [[]],
  })

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  // to match data between the form and the product
  setFormValue(formLike: Partial<Product>) {
    // this.productForm.patchValue(formLike as any);
    this.productForm.reset(this.product() as any); // same but also make form pristine
    this.productForm.patchValue({ tags: formLike.tags?.join(',') });
  }

  onSizesCLick(size: string) {
    const currentSizes = this.productForm.value.sizes ?? [];

    if (currentSizes.includes(size)) {
      this.productForm.patchValue({ sizes: currentSizes.filter(s => s !== size) });
    } else {
      this.productForm.patchValue({ sizes: [...currentSizes, size] });
    }
  }

  onSubmit() {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();

    if (!isValid)  return;

    const formValue = this.productForm.value;

    // prepare the product data
    const productLike: Partial<Product> = {
      ...formValue as any,
      tags: formValue.tags?.toLowerCase().split(',').map(tag => tag.trim())
    };

    this.productService.updateProduct(this.product().id, productLike).subscribe(
      product => {
        console.log('Product updated', product); 
      }
    )
  }
}
