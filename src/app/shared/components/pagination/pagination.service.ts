import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class PaginationService {

  private activatedRoute = inject(ActivatedRoute)

  // reactive url
  currentPage = toSignal(this.activatedRoute.queryParamMap.pipe(
    map(params => {
      const pageParam = params.get('page');
      const page = Number(pageParam);
      return !isNaN(page) && page > 0 ? page : 1;
    })
  ),
  {
    initialValue: 1
  })
}
