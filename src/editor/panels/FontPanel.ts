import { FontSize } from "../../core/FontSize";
import { FontFamily } from "../FontFamily";
import { Language } from "../Language";
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
    language: Language,
    fontFamilies: FontFamily[],
    currentFontFamily?: string,
    currentFontSize?: FontSize
  ) {
    super(title, language);

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
    panelDiv.style.justifyContent = 'space-between';

    const dropdown = document.createElement('select');
    dropdown.addEventListener('change', (ev) => {
      this.setFontFamily((<HTMLSelectElement>ev.target).value);
    });
    dropdown.style.flexGrow = '2';
    dropdown.style.marginRight = '5px';
    panelDiv.appendChild(dropdown);
    this.fontFamilies.forEach((f) => {
      const option = document.createElement('option');
      option.label = f.label;
      option.value = f.value;
      option.selected = f.value === this.currentFontFamily;
      option.style.fontFamily = f.value;
      option.style.fontSize = '1.1rem';
      dropdown.appendChild(option);
    });

    const sizePanel = document.createElement('div');
    sizePanel.style.display = 'flex';
    panelDiv.appendChild(sizePanel);

    const smallerFontButton = document.createElement('button');
    smallerFontButton.style.display = 'flex';
    smallerFontButton.style.alignItems = 'center';
    smallerFontButton.style.width = '24px';
    smallerFontButton.style.height = '24px';
    smallerFontButton.style.padding = '3px';
    smallerFontButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M5.12,14L7.5,7.67L9.87,14M6.5,5L1,19H3.25L4.37,16H10.62L11.75,19H14L8.5,5H6.5M18,17L23,11.93L21.59,10.5L19,13.1V7H17V13.1L14.41,10.5L13,11.93L18,17Z" /></svg>';
    smallerFontButton.title = this.language.getString('toolbox-decreasefontsize-title') ?? 'decrease font size';
    smallerFontButton.addEventListener('click', () => this.setFontSize(-1));
    sizePanel.appendChild(smallerFontButton);

    const largerFontButton = document.createElement('button');
    largerFontButton.style.display = 'flex';
    largerFontButton.style.alignItems = 'center';
    largerFontButton.style.width = '24px';
    largerFontButton.style.height = '24px';
    largerFontButton.style.padding = '3px';
    largerFontButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M5.12,14L7.5,7.67L9.87,14M6.5,5L1,19H3.25L4.37,16H10.62L11.75,19H14L8.5,5H6.5M18,7L13,12.07L14.41,13.5L17,10.9V17H19V10.9L21.59,13.5L23,12.07L18,7Z" /></svg>';
    largerFontButton.title = this.language.getString('toolbox-increasefontsize-title') ?? 'increase font size';
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
