import { ColorSet } from "../EditorSettings";
import { ColorChangeHandler, ColorPickerPanel } from "./ColorPickerPanel";
import { LineStyleChangeHandler, LineStylePanel } from "./LineStylePanel";
import { PropertyPanelBase } from "./PropertyPanelBase";

export interface ShapePropertiesPanelProperties {
  fillColors: ColorSet,
  fillColor?: string,
  strokeColors: ColorSet,
  strokeColor?: string
  lineStyles: string[],
  lineStyle?: string
}

export class ShapePropertiesPanel extends PropertyPanelBase {
  private strokePanel: ColorPickerPanel;
  private fillPanel: ColorPickerPanel;
  private lineStylePanel: LineStylePanel;

  public onStrokeColorChanged?: ColorChangeHandler;
  public onFillColorChanged?: ColorChangeHandler;
  public onLineStyleChanged?: LineStyleChangeHandler;

  public strokeColor?: string;
  public fillColor?: string;
  public lineStyle?: string;

  constructor(title: string, properties: ShapePropertiesPanelProperties) {
    super(title);

    this.strokeColorChanged = this.strokeColorChanged.bind(this);
    this.fillColorChanged = this.fillColorChanged.bind(this);
    this.lineStyleChanged = this.lineStyleChanged.bind(this);

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

    this.lineStyle = properties.lineStyle
    this.lineStylePanel = new LineStylePanel(
      'Line style',
      properties.lineStyles,
      this.lineStyle
    );
    this.lineStylePanel.onLineStyleChanged = this.lineStyleChanged;
    
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

    const lineStyleTitle = document.createElement('h3');
    lineStyleTitle.innerText = 'Line style';
    panelDiv.appendChild(lineStyleTitle);
    this.lineStylePanel.currentStyle = this.lineStyle;
    panelDiv.appendChild(this.lineStylePanel.getUi());

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

  private lineStyleChanged(newStyle: string) {
    if (this.onLineStyleChanged) {
      this.onLineStyleChanged(newStyle);
    }
  }
}
