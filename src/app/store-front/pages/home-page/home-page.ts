import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
// SERVICES
import { ProductsService } from '@products/services/products.service';
// COMPONENTS
import { ProductCard } from '@products/components/product-card/product-card';
import { Pagination } from "@shared/components/pagination/pagination";
import { PaginationService } from '@shared/components/pagination/pagination.service';



@Component({
  selector: 'app-home-page',
  imports: [ProductCard, Pagination],
  templateUrl: './home-page.html',
})

export class HomePage {

  productsService = inject(ProductsService)
  paginationService = inject(PaginationService)

  currentPage = this.paginationService.currentPage;
  

  productsResource = rxResource({
    params: () => ({ page: this.currentPage() }),
    stream: ({ params }) => this.productsService.getProducts({
      limit: 9,
      offset: (params.page - 1) * 9
    })
  })
}
