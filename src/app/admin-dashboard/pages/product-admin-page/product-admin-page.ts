import { Component, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '@products/services/products.service';
import { map } from 'rxjs';
import { ProductDetails } from "@dashboard/components/product-details/product-details";


@Component({
  selector: 'product-admin-page',
  imports: [ProductDetails],
  templateUrl: './product-admin-page.html',
})


export class ProductAdminPage {

  productsService = inject(ProductsService);

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  productId = toSignal(this.activatedRoute.params.pipe(
    map(params => params['id'])
  ))


  productResource = rxResource({
    params: () => ({ id: this.productId() }),
    stream: ({ params }) => this.productsService.getProductById(params.id)
  })

  redirectEffect = effect(() => {
    if (this.productResource.error()) {
      setTimeout(() => this.router.navigate(['admin/products']), 1000);
    }
  })
}

