import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductTable } from "@products/components/product-table/product-table";
// SERVICES
import { ProductsService } from '@products/services/products.service';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { Pagination } from "@shared/components/pagination/pagination";
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'products-admin-page',
  imports: [ProductTable, Pagination],
  templateUrl: './products-admin-page.html',
})


export class ProductsAdminPage {

  productsService = inject(ProductsService)
  paginationService = inject(PaginationService)

  router = inject(Router)
  activatedRoute = inject(ActivatedRoute)

  currentPage = this.paginationService.currentPage;
  productsPerPage = signal(10);

  /* 
    params: function should include all signals that should trigger updates — 
    even if they're not used directly in params. (In this case, _trigger.)
  */
  productsResource = rxResource({ 
    params: () => ({ 
      page: this.currentPage(), 
      limit: this.productsPerPage()  
    }),
    stream: ({ params }) => this.productsService.getProducts({
      limit: params.limit,
      offset: (params.page - 1) * 10
    })
  })


  onSelectChange(limit: string) {
    this.productsPerPage.set(Number(limit));
    
    // 🔁 Update the query param: page = 1 (preserve others if needed)
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge', // ✅ keep other params like sort, filter, etc.
    });
  }
}
