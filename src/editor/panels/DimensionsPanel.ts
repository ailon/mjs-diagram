import { Language } from '../Language';
import { PropertyPanelBase } from './PropertyPanelBase';

/**
 * Dimensions change event handler type.
 */
export type DimensionsChangeHandler = (newWidth: number, newHeight: number) => void;

/**
 * Dimensions toolbox panel.
 */
export class DimensionsPanel extends PropertyPanelBase {
  /**
   * Current width.
   */
  public currentWidth = 0;
  /**
   * Current height.
   */
  public currentHeight = 0;

  private widthInput!: HTMLInputElement;
  private heightInput!: HTMLInputElement;

  /**
   * Dimension change event handler.
   */
  public onDimensionsChanged?: DimensionsChangeHandler;

  /**
   * {@inheritDoc editor!PropertyPanelBase.constructor}
   */
  constructor(title: string, language: Language, currentWidth: number, currentHeight: number) {
    super(title, language);
    this.currentWidth = currentWidth;
    this.currentHeight = currentHeight;

    this.setCurrentDimensions = this.setCurrentDimensions.bind(this);
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.flexWrap = 'wrap';
    panelDiv.style.alignItems = 'center';

    const widthLabel = document.createElement('span');
    widthLabel.innerText = this.language.getString('toolbox-widthshort-label') ?? 'W:';
    panelDiv.appendChild(widthLabel);

    this.widthInput = document.createElement('input');
    this.widthInput.type = 'text';
    this.widthInput.value = this.currentWidth.toString();
    this.widthInput.addEventListener('change', () => {
      this.setCurrentDimensions(Number.parseInt(this.widthInput.value), undefined);
    });
    this.widthInput.style.textAlign = 'right';
    this.widthInput.style.margin = '0px 10px 0px 4px';
    this.widthInput.style.width = '2.5rem';

    panelDiv.appendChild(this.widthInput);

    const heightLabel = document.createElement('span');
    heightLabel.innerText = this.language.getString('toolbox-heightshort-label') ?? 'H:';
    panelDiv.appendChild(heightLabel);

    this.heightInput = document.createElement('input');
    this.heightInput.type = 'text';
    this.heightInput.value = this.currentHeight.toString();
    this.heightInput.addEventListener('change', () => {
      this.setCurrentDimensions(undefined, Number.parseInt(this.heightInput.value));
    });
    this.heightInput.style.textAlign = 'right';
    this.heightInput.style.marginLeft = '4px';
    this.heightInput.style.width = '2.5rem';
    panelDiv.appendChild(this.heightInput);

    return panelDiv;
  }

  private setCurrentDimensions(width?: number, height?: number) {
    let valueChanged = false;
    if (width !== undefined && width !== this.currentWidth) {
      this.currentWidth = width;
      valueChanged = true;
    }
    if (height !== undefined && height !== this.currentHeight) {
      this.currentHeight = height;
      valueChanged = true;
    }

    if (this.onDimensionsChanged && valueChanged) {
      this.onDimensionsChanged(this.currentWidth, this.currentHeight);
    }
  }
}
