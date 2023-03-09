import { PropertyPanelBase } from './PropertyPanelBase';

export type DimensionsChangeHandler = (newWidth: number, newHeight: number) => void;

export class DimensionsPanel extends PropertyPanelBase {
  private currentWidth = 0;
  private currentHeight = 0;

  private widthInput!: HTMLInputElement;
  private heightInput!: HTMLInputElement;

  public onDimensionsChanged?: DimensionsChangeHandler;

  constructor(title: string, currentWidth: number, currentHeight: number) {
    super(title);
    this.currentWidth = currentWidth;
    this.currentHeight = currentHeight;

    this.setCurrentDimensions = this.setCurrentDimensions.bind(this);
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.flexWrap = 'wrap';

    this.widthInput = document.createElement('input');
    this.widthInput.type = 'text';
    this.widthInput.value = this.currentWidth.toString();
    this.widthInput.addEventListener('change', () => {
      this.setCurrentDimensions(Number.parseInt(this.widthInput.value), undefined);
    })
    panelDiv.appendChild(this.widthInput);

    this.heightInput = document.createElement('input');
    this.heightInput.type = 'text';
    this.heightInput.value = this.currentHeight.toString();
    this.heightInput.addEventListener('change', () => {
      this.setCurrentDimensions(undefined, Number.parseInt(this.heightInput.value));
    })
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
