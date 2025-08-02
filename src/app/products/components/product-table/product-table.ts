import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';


@Component({
  selector: 'product-table',
  imports: [RouterLink ,ProductImagePipe, CurrencyPipe],
  templateUrl: './product-table.html',
})

export class ProductTable {

  products = input.required<Product[]>();

}
