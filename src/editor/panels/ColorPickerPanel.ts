import { ColorSet } from "../ColorSet";
import { Color } from "../Color";
import { PropertyPanelBase } from './PropertyPanelBase';
import { Language } from "../Language";

/**
 * Color change event handler type.
 */
export type ColorChangeHandler = (newColor: string) => void;

/**
 * Color picker tooblox panel.
 */
export class ColorPickerPanel extends PropertyPanelBase {
  /**
   * Available colors.
   */
  public colors: ColorSet = [];
  /**
   * Selected color.
   */
  public currentColor?: string;
  private colorBoxes: HTMLDivElement[] = [];

  /**
   * Color change event handler.
   */
  public onColorChanged?: ColorChangeHandler;

  /**
   * {@inheritDoc editor!PropertyPanelBase.constructor}
   */
  constructor(title: string, language: Language, colors: ColorSet, currentColor?: string) {
    super(title, language);
    this.colors = colors;
    this.currentColor = currentColor;

    this.setCurrentColor = this.setCurrentColor.bind(this);
    this.getColorBox = this.getColorBox.bind(this);
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.flexWrap = 'wrap';
    this.colors.forEach((color) => {
      const colorBoxContainer = this.getColorBox(color);
      panelDiv.appendChild(colorBoxContainer);
      this.colorBoxes.push(colorBoxContainer);
    });
    return panelDiv;
  }

  private getColorBox(color: Color): HTMLDivElement {
    const baseHeight = 40; // @todo: configurable
    // const accentColor = 'red'; // @todo: configurable

    const buttonPadding = baseHeight / 4;
    const buttonHeight = baseHeight - buttonPadding;

    const colorBox = document.createElement('div');
    colorBox.style.display = 'flex';
    colorBox.style.alignItems = 'center';
    colorBox.style.justifyContent = 'center';
    colorBox.style.width = `${buttonHeight - 2}px`;
    colorBox.style.height = `${buttonHeight - 2}px`;
    colorBox.style.backgroundColor = color.value;
    colorBox.style.borderWidth = '2px';
    colorBox.style.borderStyle = 'solid';
    colorBox.style.borderColor =
      color.value === this.currentColor ? 'var(--i-mjsdiae-accent-color)' : 'var(--i-mjsdiae-background-color)';
    colorBox.style.borderRadius = '3px';
    if (color.value === 'transparent') {
      colorBox.style.color = 'var(--i-mjsdiae-accent-color)';
      colorBox.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24">
      <path fill="currentColor" d="M22.11 21.46L2.39 1.73L1.11 3L3 4.9V19C3 20.11 3.9 21 5 21H19.1L20.84 22.73L22.11 21.46M5 19V6.89L17.11 19H5M8.2 5L6.2 3H19C20.1 3 21 3.89 21 5V17.8L19 15.8V5H8.2Z" />
  </svg>`;
    }
    colorBox.addEventListener('click', () => {
      this.setCurrentColor(color.value, colorBox);
    });

    return colorBox;
  }

  private setCurrentColor(color: string, target: HTMLDivElement) {
    this.currentColor = color;

    this.colorBoxes.forEach((box) => {
      box.style.borderColor = box === target ? 'var(--i-mjsdiae-accent-color)' : 'var(--i-mjsdiae-background-color)';
    });

    if (this.onColorChanged) {
      this.onColorChanged(color);
    }
  }
}
