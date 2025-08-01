import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Product, ProductResponse } from '@products/interfaces/product.interface';
import { delay, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';


const baseUrl = environment.baseUrl;

interface Options {
  limit?: number,
  offset?: number,
  gender?: string,

}


@Injectable({
  providedIn: 'root'
})


export class ProductsService {
  private http = inject(HttpClient);

  // to cache data, so we don't have to make a request every time
  private productsCache =new Map<string, ProductResponse>();
  private productCache = new Map<string, Product>();


  getProducts(options?: Options): Observable<ProductResponse> {
    // console.log(this.productsCache);
    
    const { limit = 9, offset = 0, gender = '' } = options ?? {};

    const key = `${limit}-${offset}-${gender}`; // create a cache unique key
    // check if the key is in the cache
    if (this.productsCache.has(key)) {
      // if it is, return the value of the key
      return of(this.productsCache.get(key)!); 
    }

    // if not, make a request
    return this.http.get<ProductResponse>(`${baseUrl}/products`, {
      params: {
        limit,
        offset,
        gender
      }
    })
    .pipe(
      // delay(1000),
      // tap(console.log),
      // store the response in the cache (key:string, value:ProductResponse)
      tap(resp => this.productsCache.set(key, resp)),
    )
  }


  getProductByIdSlug(idSlug: string): Observable<Product> {

    const key = idSlug;

    if (this.productCache.has(key)) {
      return of(this.productCache.get(key)!);
    }
    
    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`)
      .pipe(
        // tap(console.log),
        delay(1000),
        tap(resp => this.productCache.set(key, resp))
      )
  }





}
