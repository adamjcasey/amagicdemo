import { Injectable } from "@angular/core";

@Injectable()
export class UtilsService {
  createMasonryLayout(wrapper: Element) {
    const applyMasonry = () => {
      const resizeGridItem = (item: any) => {
        const rowHeight = 12;
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

    const images = wrapper.querySelectorAll('.card .card__image img');
    let loadedImages = 0;
    images.forEach(image => {
      image.addEventListener('load', () => {
        loadedImages++;
        if (loadedImages === images.length) {
          wrapper.classList.add('layout-loaded');
          applyMasonry();
        }
      });
    });
  }

  humanizeBodyPartInjected(bodyPart: string) {
    let text;
    switch(bodyPart) {
      case 'top-left':
        text = 'Right Abdomen';
        break;
      case 'top-right':
        text = 'Left Abdomen';
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

  static getParentByClass(element: any, parentClass: any) {
    let parents: any = [];
    let nextParent = element.parentNode;

    do {
      const parent = nextParent;
      if (parent.classList.contains(parentClass)) {
        parents.push(parent);
      }
      nextParent = parent.parentNode;
      if (nextParent === document.body) {
        break;
      }
    } while (parents.length === 0);
    return parents[0];
  }
}
