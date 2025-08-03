import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { User } from '@auth/interfaces/user.interface';
import { Gender, type Product, type ProductResponse } from '@products/interfaces/product.interface';
import { delay, forkJoin, map, mergeMap, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';


interface Options {
  limit?: number,
  offset?: number,
  gender?: string,

}

const baseUrl = environment.baseUrl;

const emptyProduct: Product = {
  id: 'new',
  title: '',
  description: '',
  slug: '',
  price: 0,
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User
};



@Injectable({
  providedIn: 'root'
})


export class ProductsService {
  private http = inject(HttpClient);

  // to cache data, so we don't have to make a request every time
  private productsCache =new Map<string, ProductResponse>();
  private productCache = new Map<string, Product>();



  // GET ALL PRODUCTS
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


  // GET PRODUCT BY SLUG
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


  // GET PRODUCT BY ID
  getProductById(id: string): Observable<Product> {
    // case of creating a new product (id = 'new')
    if (id === 'new') return of(emptyProduct);

    if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }

    return this.http.get<Product>(`${baseUrl}/products/${id}`)
      .pipe(
        tap(product => this.productCache.set(id, product))
      )
  }


  // UPDATE PRODUCT
  updateProduct(
    id: string, 
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {
    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFileList) // if no images return empty array always, so no image changes
      .pipe(
        // map(imageNames => ({...productLike, images: imageNames})), // change the images by new ones
        map(imageNames => ({...productLike, images: [ ...currentImages, ...imageNames]})), // add new images to existing in the product
        mergeMap(productLike => 
          this.http.patch<Product>(`${baseUrl}/products/${id}`, productLike)),
          tap(product => this.updateCache(product))
      )
      /* 
        switchMap cancels the first upload in progress and starts a new one (bad for upload files, good for search inputs If the user types quickly, older HTTP requests are canceled. Only the latest API call matters.)
        concatMap is used to concatenate multiple observables (one after another) uploads 1 image at a time
        mergeMap is used to merge multiple observables into one, (example: to upload images in parallel (faster))
        map is used to transform the data
        tap is used to do something with the data
      */
  }


  // CREATE PRODUCT
  createProduct(
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {
    // initially the product has no images so images = []
    return this.uploadImages(imageFileList) // if no images return an empty array, so no image changes
      .pipe(
        map(imageNames => ({...productLike, images: imageNames})), // change the images by new ones
        mergeMap(productLike => 
          this.http.post<Product>(`${baseUrl}/products`, productLike)),
          tap(product => this.updateCache(product))
      )
  }


  // UPDATE CACHE METHOD - to update the cache always when a product is updated, created or deleted
  updateCache(product: Product, refresh: boolean = true) {
    const productId = product.id;

    // update the cache product
    this.productCache.set(productId, product);

    // update the cache products - inefficient foreach loop never stops
    // if (refresh) {
    //   this.productsCache.forEach((productResponse, key) => {
    //     this.productsCache.set(key, {
    //       ...productResponse,
    //       products: productResponse.products.map(p => p.id === productId ? product : p)
    //     })
    //   })
    // }

    /* 
      when create a new product it's not in the cache of products (this.productsCache), 
      so avoid the foreach or for loop
    */
    if (refresh) {
      console.log('cache refreshed');
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


  uploadImages(images: FileList | undefined): Observable<string[]> {
    if (!images) return of([]);

    const uploadObservables= Array.from(images).map(image => this.uploadImage(image));
    /* 
      return the array of observables so "forkJoin" can combine them
      and wait for all to complete and if any of them fails it will return an error
    */
    return forkJoin(uploadObservables)
    // If want to see the array of image names
      .pipe(
        tap(imageNames => console.log(imageNames))
      )

  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);

    //backend response is: {fileName: string, secureUrl: string} so:
    return this.http.post<{fileName: string}>(`${baseUrl}/files/product`, formData)
      .pipe(map(resp => resp.fileName))
  }


  // TODO: DELETE PRODUCT
  deleteProduct(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${baseUrl}/products/${id}`)
  }
}
