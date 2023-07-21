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

  humanizeBodyPartInjected(bodyPart: string) {
    let text;
    switch(bodyPart) {
      case 'top-left':
        text = 'Right Chest';
        break;
      case 'top-right':
        text = 'Left Chest';
        break;

      case 'bottom-left':
        text = 'Right Thigh';
        break;
      case 'bottom-right':
        text = 'Left Thigh';
        break;
    }

    return text;
  }
}
