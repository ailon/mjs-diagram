import { ColorSet } from "../ColorSet";
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
  lineWidths: string[],
  lineWidth: string
}

export class ShapePropertiesPanel extends PropertyPanelBase {
  private strokePanel: ColorPickerPanel;
  private fillPanel: ColorPickerPanel;
  private lineStylePanel: LineStylePanel;
  private lineWidthPanel: LineStylePanel;

  public onStrokeColorChanged?: ColorChangeHandler;
  public onFillColorChanged?: ColorChangeHandler;
  public onLineStyleChanged?: LineStyleChangeHandler;
  public onLineWidthChanged?: LineStyleChangeHandler;

  public strokeColor?: string;
  public fillColor?: string;
  public lineStyle?: string;
  public lineWidth?: string;

  constructor(title: string, properties: ShapePropertiesPanelProperties) {
    super(title);

    this.strokeColorChanged = this.strokeColorChanged.bind(this);
    this.fillColorChanged = this.fillColorChanged.bind(this);
    this.lineStyleChanged = this.lineStyleChanged.bind(this);
    this.lineWidthChanged = this.lineWidthChanged.bind(this);

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

    this.lineStyle = properties.lineStyle;
    this.lineStylePanel = new LineStylePanel(
      'Line style',
      'stroke-dasharray',
      properties.lineStyles,
      this.lineStyle
    );
    this.lineStylePanel.lineAttributes = [['stroke-width', '3']];
    this.lineStylePanel.onLineStyleChanged = this.lineStyleChanged;
    
    this.lineWidth = properties.lineWidth;
    this.lineWidthPanel = new LineStylePanel(
      'Line width',
      'stroke-width',
      properties.lineWidths,
      this.lineWidth
    );
    this.lineWidthPanel.onLineStyleChanged = this.lineWidthChanged;
    
  }

  public getUi(): HTMLDivElement {
    function addTitle(text: string): HTMLHeadingElement {
      const title = document.createElement('h3');
      title.innerText = text;
      return title;
    }

    const panelDiv = document.createElement('div');

    panelDiv.appendChild(addTitle('Line color'));
    this.strokePanel.currentColor = this.strokeColor;
    panelDiv.appendChild(this.strokePanel.getUi());

    panelDiv.appendChild(addTitle('Fill color'));
    this.fillPanel.currentColor = this.fillColor;
    panelDiv.appendChild(this.fillPanel.getUi());

    panelDiv.appendChild(addTitle('Line width'));
    this.lineWidthPanel.currentStyle = this.lineWidth;
    panelDiv.appendChild(this.lineWidthPanel.getUi());

    panelDiv.appendChild(addTitle('Line style'));
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

  private lineWidthChanged(newWidth: string) {
    if (this.onLineWidthChanged) {
      this.onLineWidthChanged(newWidth);
    }
  }
}
