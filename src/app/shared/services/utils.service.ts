import { Injectable } from "@angular/core";

@Injectable()
export class UtilsService {
  createMasonryLayout(wrapper: Element) {
    const resizeGridItem = (item: any) => {
      const rowHeight = parseInt(window.getComputedStyle(wrapper).getPropertyValue('grid-auto-rows'));
      // const rowHeight = 20;
      // console.log('rowHeight ', rowHeight);
      const rowGap = parseInt(window.getComputedStyle(wrapper).getPropertyValue('grid-row-gap'));
      // const rowGap = 25;
      // console.log('rowGap ', rowGap);
      const rowSpan = Math.ceil((item.firstChild.clientHeight + rowGap) / (rowHeight + rowGap));
      // const rowSpan = Math.ceil((item.firstChild.clientHeight + rowGap) / rowGap);
      // console.log('rowSpan ', rowSpan);
      item.style.gridRowEnd = `span ${rowSpan}`;
    }

    const items = wrapper.children;
    console.log('items ', items);
    const resizeItems = () => {
      for(let i = 0; i < items.length; i++) {
        resizeGridItem(items[i]);
      }
    }

    resizeItems();
    window.addEventListener('resize', resizeItems);
  }
}
