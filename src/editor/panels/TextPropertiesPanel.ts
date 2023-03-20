import { ColorSet } from "../EditorSettings";
import { ColorChangeHandler, ColorPickerPanel } from "./ColorPickerPanel";
import { PropertyPanelBase } from "./PropertyPanelBase";

export interface TextPropertiesPanelProperties {
  textColors: ColorSet,
  textColor?: string,
}

export class TextPropertiesPanel extends PropertyPanelBase {
  private colorPanel: ColorPickerPanel;

  public onColorChanged?: ColorChangeHandler;

  public textColor?: string;

  constructor(title: string, properties: TextPropertiesPanelProperties) {
    super(title);

    this.colorChanged = this.colorChanged.bind(this);

    this.textColor = properties.textColor;
    this.colorPanel = new ColorPickerPanel(
      'Color',
      properties.textColors,
      this.textColor
    );
    this.colorPanel.onColorChanged = this.colorChanged;
  }

  public getUi(): HTMLDivElement {
    function addTitle(text: string): HTMLHeadingElement {
      const title = document.createElement('h3');
      title.innerText = text;
      return title;
    }

    const panelDiv = document.createElement('div');

    panelDiv.appendChild(addTitle('Text color'));
    this.colorPanel.currentColor = this.textColor;
    panelDiv.appendChild(this.colorPanel.getUi());

    return panelDiv;
  }

  private colorChanged(newColor: string) {
    if (this.onColorChanged) {
      this.onColorChanged(newColor);
    }
  }
}
