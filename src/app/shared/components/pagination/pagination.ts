import { Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'pagination',
  imports: [RouterLink],
  templateUrl: './pagination.html',
})

export class Pagination {
  addHtmlMargin = input<boolean>(true);
  small = input<boolean>(false);

  totalPages = input<number>(0);
  currentPage = input<number>(1);

  activePage = linkedSignal(() => this.currentPage());

  getPagesNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  });
}
