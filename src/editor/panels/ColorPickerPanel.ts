import { PropertyPanelBase } from './PropertyPanelBase';

export type ColorChangeHandler = (newColor: string) => void;

export class ColorPickerPanel extends PropertyPanelBase {
  public colors: string[] = [];
  private currentColor?: string;
  private colorBoxes: HTMLDivElement[] = [];

  public onColorChanged?: ColorChangeHandler;

  constructor(title: string, colors: string[], currentColor?: string) {
    super(title);
    this.colors = colors;
    this.currentColor = currentColor;

    this.setCurrentColor = this.setCurrentColor.bind(this);
    this.getColorBox = this.getColorBox.bind(this);
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.flexWrap = 'wrap';
    // panelDiv.style.overflow = 'hidden';
    // panelDiv.style.whiteSpace = 'nowrap';
    this.colors.forEach((color) => {
      const colorBoxContainer = this.getColorBox(color);
      panelDiv.appendChild(colorBoxContainer);
      this.colorBoxes.push(colorBoxContainer);
    });
    return panelDiv;
  }

  private getColorBox(color: string): HTMLDivElement {
    const baseHeight = 40; // @todo: configurable
    // const accentColor = 'red'; // @todo: configurable

    const buttonPadding = baseHeight / 4;
    const buttonHeight = baseHeight - buttonPadding;

    // const colorBoxContainer = document.createElement('div');
    // colorBoxContainer.style.display = 'inline-block';
    //colorBoxContainer.style.boxSizing = 'content-box';
    // colorBoxContainer.style.width = `${buttonHeight - 2}px`;
    // colorBoxContainer.style.height = `${buttonHeight - 2}px`;
    // colorBoxContainer.style.padding = '1px';
    // colorBoxContainer.style.marginRight = '2px';
    // colorBoxContainer.style.marginBottom = '2px';
    // colorBoxContainer.style.borderWidth = '2px';
    // colorBoxContainer.style.borderStyle = 'solid';
    //colorBoxContainer.style.borderRadius = `${(buttonHeight + 2) / 2}px`;
    // colorBoxContainer.style.borderColor =
    //   color === this.currentColor ? accentColor : 'transparent';

    const colorBox = document.createElement('div');
    colorBox.style.display = 'flex';
    colorBox.style.width = `${buttonHeight - 2}px`;
    colorBox.style.height = `${buttonHeight - 2}px`;
    colorBox.style.backgroundColor = color;
    colorBox.style.borderWidth = '2px';
    colorBox.style.borderStyle = 'solid';
    colorBox.style.borderColor =
      color === this.currentColor ? 'var(--i-mjstb-accent-color)' : '#444';
    colorBox.style.borderRadius = '3px';
    if (color === 'transparent') {
      colorBox.style.color = 'var(--i-mjstb-accent-color)';
      colorBox.innerHTML = `<svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.11 21.46L2.39 1.73L1.11 3L3 4.9V19C3 20.11 3.9 21 5 21H19.1L20.84 22.73L22.11 21.46M5 19V6.89L17.11 19H5M8.2 5L6.2 3H19C20.1 3 21 3.89 21 5V17.8L19 15.8V5H8.2Z" />
  </svg>`;
    }
    colorBox.addEventListener('click', () => {
      this.setCurrentColor(color, colorBox);
    });

    // colorBoxContainer.appendChild(colorBox);

    return colorBox;
  }

  private setCurrentColor(color: string, target: HTMLDivElement) {
    this.currentColor = color;

    this.colorBoxes.forEach((box) => {
      box.style.borderColor = box === target ? 'var(--i-mjstb-accent-color)' : '#444';
    });

    if (this.onColorChanged) {
      this.onColorChanged(color);
    }
  }
}
