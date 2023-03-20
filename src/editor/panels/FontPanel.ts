import { FontFamily } from '../EditorSettings';
import { PropertyPanelBase } from './PropertyPanelBase';

export type FontFamilyChangeHandler = (newStyle: string) => void;

export class FontPanel extends PropertyPanelBase {
  public fontFamilies: FontFamily[] = [];
  public currentFontFamily?: string;

  public onFontFamilyChanged?: FontFamilyChangeHandler;

  constructor(title: string, fontFamilies: FontFamily[], currentFontFamily?: string) {
    super(title);

    this.setFontFamily = this.setFontFamily.bind(this);
    
    this.fontFamilies = fontFamilies;
    this.currentFontFamily = currentFontFamily;
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
    return panelDiv;
  }
  
  private setFontFamily(value: string) {
    this.currentFontFamily = value;
    if (this.onFontFamilyChanged) {
      this.onFontFamilyChanged(value);
    }
  }
}
