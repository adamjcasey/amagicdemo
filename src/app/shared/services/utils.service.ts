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

        if (i + 1 === items.length) {
          if (!wrapper.classList.contains('masonry-initialized')) {
            wrapper.classList.add('masonry-initialized')
          }
        }
      }
    }

    let loadedItems = 0;
    const controller = setInterval(() => {
      Array.from(items).forEach((element: any, index: number) => {
        const image = element.querySelector('.card__image ion-img');
        if (image && image.offsetHeight !== 0) {
          loadedItems++;
        }
      });

      if (loadedItems === items.length) {
        resizeItems();
        clearInterval(controller);
      }
    }, 200);
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

  humanizeSeveritySymptom(value: number) {
    let text;
    switch(value) {
      case 1:
        text = 'Very Severe';
        break;
      case 2:
        text = 'Severe';
        break;
      case 3:
        text = 'Normal';
        break;
      case 4:
        text = 'Low severe';
        break;
      case 5:
        text = 'Absent';
        break;
    }

    return text;
  }

  static getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
