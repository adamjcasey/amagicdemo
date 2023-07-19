import { Injectable } from "@angular/core";

@Injectable()
export class UtilsService {
  createMasonryLayout(wrapper: Element) {
    const resizeGridItem = (item: any) => {
      const rowHeight = parseInt(window.getComputedStyle(wrapper).getPropertyValue('grid-auto-rows'));
      const rowGap = parseInt(window.getComputedStyle(wrapper).getPropertyValue('grid-row-gap'));
      const rowSpan = Math.ceil((item.firstChild.clientHeight + rowGap) / (rowHeight + rowGap));
      item.style.gridRowEnd = `span ${rowSpan}`;
    }

    const items = wrapper.children;
    const resizeItems = () => {
      for(let i = 0; i < items.length; i++) {
        resizeGridItem(items[i]);
      }
    }

    resizeItems();
    window.addEventListener('resize', resizeItems);
  }
}
