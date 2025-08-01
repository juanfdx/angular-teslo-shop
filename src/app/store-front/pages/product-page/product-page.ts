import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
// SERVICES
import { ProductsService } from '@products/services/products.service';
import { ProductSlider } from "@products/components/product-slider/product-slider";


@Component({
  selector: 'app-product-page',
  imports: [ProductSlider],
  templateUrl: './product-page.html',
})


export class ProductPage {

  productsService = inject(ProductsService)
  activatedRoute = inject(ActivatedRoute);

  //url no reactive, if url params change on same page, this will not update, in that case use linkedSignal
  productIdSlug = this.activatedRoute.snapshot.paramMap.get('idSlug') ?? ''


  productResource = rxResource({
    params: () => this.productIdSlug,
    stream: ({ params }) => this.productsService.getProductByIdSlug(params)
  })
}
