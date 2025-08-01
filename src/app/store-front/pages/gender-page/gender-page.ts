import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '@products/services/products.service';
import { map } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
// COMPONENTS
import { ProductCard } from "@products/components/product-card/product-card";
import { Pagination } from "@shared/components/pagination/pagination";
import { PaginationService } from '@shared/components/pagination/pagination.service';


@Component({
  selector: 'app-gender-page',
  imports: [ProductCard, TitleCasePipe, Pagination],
  templateUrl: './gender-page.html',
})

export class GenderPage {

  productsService = inject(ProductsService)
  activatedRoute = inject(ActivatedRoute);
  paginationService = inject(PaginationService)
  
  currentPage = this.paginationService.currentPage;
  
  // reactive gender param
  param = toSignal(this.activatedRoute.paramMap.pipe(
    map(params => params.get('gender') ?? '')
  ));

  
  productsResource = rxResource({
    params: () => ({ gender: this.param(), page: this.currentPage() }),
    stream: ({ params }) => this.productsService.getProducts({ 
      limit: 9,
      offset: (params.page - 1) * 9,
      gender: params.gender
     })
  })
}
