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


  //GET ALL PRODUCTS
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


  //GET PRODUCT BY SLUG
  getProductByIdSlug(idSlug: string): Observable<Product> {
    const key = idSlug;

    if (this.productCache.has(key)) {
      return of(this.productCache.get(key)!);
    }
    
    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`)
      .pipe(
        // tap(console.log),
        delay(1000),
        tap(product => this.productCache.set(key, product))
      )
  }


  //GET PRODUCT BY ID
  getProductById(id: string): Observable<Product> {
    if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }

    return this.http.get<Product>(`${baseUrl}/products/${id}`)
      .pipe(
        tap(product => this.productCache.set(id, product))
      )
  }


  //UPDATE PRODUCT
  updateProduct(id: string, productLike: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${baseUrl}/products/${id}`, productLike)
      .pipe(
        tap(product => this.updateCache(product))
      )
  }


  //UPDATE CACHE METHOD - to update the cache always when a product is updated, created or deleted
  updateCache(product: Product) {
    const productId = product.id;

    // update the cache product
    this.productCache.set(productId, product);

    // update the cache products - inefficient foreach loop never stops
    // this.productsCache.forEach((productResponse, key) => {
    //   this.productsCache.set(key, {
    //     ...productResponse,
    //     products: productResponse.products.map(p => p.id === productId ? product : p)
    //   })
    // })

    // update the cache products - more efficient
    for (const [key, productResponse] of this.productsCache) {
      const index = productResponse.products.findIndex(p => p.id === productId);
      
      if (index !== -1) {
        const updatedProducts = [...productResponse.products];
        updatedProducts[index] = product;

        this.productsCache.set(key, {
          ...productResponse,
          products: updatedProducts
        });

        break; // Stop iteration after updating
      }
    }

  /*  
    ✅ What for of loop Does Better:
    - findIndex locates the product in each array quickly.
    - Only the first matching cache entry is updated.
    - break prevents unnecessary looping.
    - set() keeps the cache up to date.
    - Immutable update via [...] ensures Angular change detection works well if relevant.
  */
  }
}
