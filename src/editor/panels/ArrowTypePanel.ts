import { ArrowType } from '../../core/ConnectorBase';
import { Language } from '../Language';
import { PropertyPanelBase } from './PropertyPanelBase';

export type ArrowTypeChangeHandler = (newType: ArrowType) => void;

export class ArrowTypePanel extends PropertyPanelBase {
  private currentType?: ArrowType;

  private typeBoxes: HTMLDivElement[] = [];

  public onArrowTypeChanged?: ArrowTypeChangeHandler;

  constructor(title: string, language: Language, currentType?: ArrowType) {
    super(title, language);
    this.currentType = currentType;

    this.setCurrentType = this.setCurrentType.bind(this);
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.overflow = 'hidden';
    panelDiv.style.flexGrow = '2';
    for (let ti = 0; ti < 4; ti++) {
      let arrowType: ArrowType = 'both';
      switch (ti) {
        case 0:
          arrowType = 'end';
          break;
        case 1:
          arrowType = 'start';
          break;
        case 2:
          arrowType = 'both';
          break;
        case 3:
          arrowType = 'none';
          break;
      }
      const typeBoxContainer = document.createElement('div');
      typeBoxContainer.style.display = 'flex';
      typeBoxContainer.style.width = '25%';
      typeBoxContainer.style.flexGrow = '2';
      typeBoxContainer.style.alignItems = 'center';
      typeBoxContainer.style.justifyContent = 'space-between';
      typeBoxContainer.style.padding = '5px';
      typeBoxContainer.style.borderWidth = '2px';
      typeBoxContainer.style.borderStyle = 'solid';
      typeBoxContainer.style.borderColor =
        arrowType === this.currentType
          ? 'var(--i-mjstb-accent-color)'
          : 'transparent';

      typeBoxContainer.addEventListener('click', () => {
        this.setCurrentType(arrowType, typeBoxContainer);
      });
      panelDiv.appendChild(typeBoxContainer);

      if (arrowType === 'both' || arrowType === 'start') {
        const leftTip = document.createElement('div');
        leftTip.style.display = 'flex';
        leftTip.style.alignItems = 'center';
        leftTip.style.minHeight = '20px';
        leftTip.innerHTML = `<svg viewBox="0 0 10 10" width="10" height="10" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,5 10,0 10,10" style="fill: var(--i-mjstb-accent-color);" />
        </svg>`;
        leftTip.style.marginLeft = '5px';
        typeBoxContainer.appendChild(leftTip);
      }

      const lineBox = document.createElement('div');
      lineBox.style.display = 'flex';
      lineBox.style.alignItems = 'center';
      lineBox.style.minHeight = '20px';
      lineBox.style.flexGrow = '2';

      const hr = document.createElement('hr');
      hr.style.minWidth = '20px';
      hr.style.border = '0px';
      hr.style.borderTop = '3px solid var(--i-mjstb-accent-color)';
      hr.style.flexGrow = '2';
      lineBox.appendChild(hr);

      typeBoxContainer.appendChild(lineBox);

      if (arrowType === 'both' || arrowType === 'end') {
        const rightTip = document.createElement('div');
        rightTip.style.display = 'flex';
        rightTip.style.alignItems = 'center';
        rightTip.style.minHeight = '20px';
        rightTip.innerHTML = `<svg viewBox="0 0 10 10" width="10" height="10" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 10,5 0,10" style="fill: var(--i-mjstb-accent-color);" />
        </svg>`;
        rightTip.style.marginRight = '5px';
        typeBoxContainer.appendChild(rightTip);
      }

      this.typeBoxes.push(typeBoxContainer);
    }
    return panelDiv;
  }

  private setCurrentType(newType: ArrowType, target: HTMLDivElement) {
    this.currentType = newType;

    this.typeBoxes.forEach((box) => {
      box.style.borderColor =
        box === target ? 'var(--i-mjstb-accent-color)' : 'transparent';
    });

    if (this.onArrowTypeChanged) {
      this.onArrowTypeChanged(this.currentType);
    }
  }
}
