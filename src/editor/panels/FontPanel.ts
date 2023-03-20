import { FontFamily, FontSize } from '../EditorSettings';
import { PropertyPanelBase } from './PropertyPanelBase';

export type FontFamilyChangeHandler = (newStyle: string) => void;
export type FontSizeChangeHandler = (newSize: FontSize) => void;

export class FontPanel extends PropertyPanelBase {
  public fontFamilies: FontFamily[] = [];
  public currentFontFamily?: string;
  public currentFontSize: FontSize = {
    value: 1,
    units: 'rem',
    step: 0.1
  };

  public onFontFamilyChanged?: FontFamilyChangeHandler;
  public onFontSizeChanged?: FontSizeChangeHandler;

  constructor(
    title: string,
    fontFamilies: FontFamily[],
    currentFontFamily?: string,
    currentFontSize?: FontSize
  ) {
    super(title);

    this.setFontFamily = this.setFontFamily.bind(this);
    this.setFontSize = this.setFontSize.bind(this);

    this.fontFamilies = fontFamilies;
    this.currentFontFamily = currentFontFamily;
    if (currentFontSize !== undefined) {
      this.currentFontSize = currentFontSize;
    }
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.flexWrap = 'wrap';

    const dropdown = document.createElement('select');
    dropdown.addEventListener('change', (ev) => {
      this.setFontFamily((<HTMLSelectElement>ev.target).value);
    });
    panelDiv.appendChild(dropdown);
    this.fontFamilies.forEach((f) => {
      const option = document.createElement('option');
      option.label = f.label;
      option.value = f.value;
      option.selected = f.value === this.currentFontFamily;
      dropdown.appendChild(option);
    });

    const sizePanel = document.createElement('div');
    panelDiv.appendChild(sizePanel);

    const smallerFontButton = document.createElement('button');
    smallerFontButton.textContent = '-';
    smallerFontButton.addEventListener('click', () => this.setFontSize(-1));
    sizePanel.appendChild(smallerFontButton);
    const largerFontButton = document.createElement('button');
    largerFontButton.textContent = '+';
    largerFontButton.addEventListener('click', () => this.setFontSize(+1));
    sizePanel.appendChild(largerFontButton);

    return panelDiv;
  }

  private setFontFamily(value: string) {
    this.currentFontFamily = value;
    if (this.onFontFamilyChanged) {
      this.onFontFamilyChanged(value);
    }
  }
  private setFontSize(direction: number) {
    this.currentFontSize.value += this.currentFontSize.step * direction;
    if (this.onFontSizeChanged) {
      this.onFontSizeChanged(this.currentFontSize);
    }
  }
}
