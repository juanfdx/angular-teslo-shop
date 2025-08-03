import { Pipe, PipeTransform } from '@angular/core';
import { isImage } from '@products/utils/product-utils';
import { environment } from 'src/environments/environment';


const noImage = 'assets/images/placeholders/no-image.jpg';
const baseUrl = environment.baseUrl;


@Pipe({
  name: 'productImage'
})

export class ProductImagePipe implements PipeTransform {

  transform(value: string | string[] | null): string {
    
    // if is a string
    if (typeof value === 'string' && value.trim() !== '' && isImage(value)) {
      return `${baseUrl}/files/product/${value}`
    }
    
    // if value is a non-empty array
    if (Array.isArray(value) && value.length > 0) {
      const image = value[0];
      if (typeof image === 'string' && image.trim() !== '' && isImage(image)) {
        return `${baseUrl}/files/product/${image}`;
      }
    }
    
    return noImage;
  }

}
