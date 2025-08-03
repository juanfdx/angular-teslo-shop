import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import type { Product } from '@products/interfaces/product.interface';
import { ProductSlider } from "@products/components/product-slider/product-slider";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabel } from "@shared/components/form-error-label/form-error-label";
import { ProductsService } from '@products/services/products.service';
import { Router } from '@angular/router';


@Component({
  selector: 'product-details',
  imports: [ProductSlider, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})

export class ProductDetails implements OnInit {
  product = input.required<Product>();
  wasSaved = output<string | null>();
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  //images
  tempImages = signal<string[]>([]);
  imageFileList: FileList | undefined = undefined;
  // imagesToSlider = computed(() => {
  //   return [...this.tempImages(), ...this.product().images];
  // });

  router = inject(Router);
  fb = inject(FormBuilder);
  
  productService = inject(ProductsService);


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

    if (this.product().id === 'new') {
      // create new product
      this.productService.createProduct(productLike, this.imageFileList).subscribe(
        product => {
          console.log('Product created');  
          this.wasSaved.emit('Product created!');
          // setTimeout(() => this.wasSaved.emit(null), 3000);
          
          // when redirect component is destroyed so setTimeout is not executed 
          this.router.navigate(['/admin/product', product.id]);
          
        }
      )
      
    }
    else {
      // update the product
      this.productService.updateProduct(this.product().id, productLike, this.imageFileList).subscribe(
        product => {
          console.log('Product updated'); 
          this.wasSaved.emit('Product updated!');
        }
      )
    }
  }


  // IMAGES
  onFilesSelected(event: Event) {
    const fileList = (event.target as HTMLInputElement).files; // FileList object
    this.tempImages.set([]); // clear temp images
    this.imageFileList = fileList ?? undefined;

    const imageUrls = Array.from(fileList ?? []).map(
      file => URL.createObjectURL(file)
    );

    this.tempImages.set(imageUrls);
  }

}
