import { ColorSet } from "../EditorSettings";
import { ColorChangeHandler, ColorPickerPanel } from "./ColorPickerPanel";
import { PropertyPanelBase } from "./PropertyPanelBase";

export interface ShapePropertiesPanelProperties {
  fillColors: ColorSet,
  fillColor?: string,
  strokeColors: ColorSet,
  strokeColor?: string
}

export class ShapePropertiesPanel extends PropertyPanelBase {
  private strokePanel: ColorPickerPanel;
  private fillPanel: ColorPickerPanel;

  public onStrokeColorChanged?: ColorChangeHandler;
  public onFillColorChanged?: ColorChangeHandler;

  public strokeColor?: string;
  public fillColor?: string;

  constructor(title: string, properties: ShapePropertiesPanelProperties) {
    super(title);

    this.strokeColorChanged = this.strokeColorChanged.bind(this);
    this.fillColorChanged = this.fillColorChanged.bind(this);

    this.strokeColor = properties.strokeColor;
    this.strokePanel = new ColorPickerPanel(
      'Line color',
      properties.strokeColors,
      this.strokeColor
    );
    this.strokePanel.onColorChanged = this.strokeColorChanged;

    this.fillColor = properties.fillColor;
    this.fillPanel = new ColorPickerPanel(
      'Fill color',
      properties.fillColors,
      this.fillColor
    );
    this.fillPanel.onColorChanged = this.fillColorChanged;
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');

    const lineColorTitle = document.createElement('h3');
    lineColorTitle.innerText = 'Line color';
    panelDiv.appendChild(lineColorTitle);
    this.strokePanel.currentColor = this.strokeColor;
    panelDiv.appendChild(this.strokePanel.getUi());

    const fillColorTitle = document.createElement('h3');
    fillColorTitle.innerText = 'Fill color';
    panelDiv.appendChild(fillColorTitle);
    this.fillPanel.currentColor = this.fillColor;
    panelDiv.appendChild(this.fillPanel.getUi());

    return panelDiv;
  }

  private strokeColorChanged(newColor: string) {
    if (this.onStrokeColorChanged) {
      this.onStrokeColorChanged(newColor);
    }
  }

  private fillColorChanged(newColor: string) {
    if (this.onFillColorChanged) {
      this.onFillColorChanged(newColor);
    }
  }
}
