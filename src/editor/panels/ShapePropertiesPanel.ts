import { ColorSet } from "../ColorSet";
import { Language } from "../Language";
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

  public fillPanelsEnabled = true;
  public strokePanelsEnabled = true;

  constructor(title: string, language: Language, properties: ShapePropertiesPanelProperties) {
    super(title, language);

    this.strokeColorChanged = this.strokeColorChanged.bind(this);
    this.fillColorChanged = this.fillColorChanged.bind(this);
    this.lineStyleChanged = this.lineStyleChanged.bind(this);
    this.lineWidthChanged = this.lineWidthChanged.bind(this);

    this.strokeColor = properties.strokeColor;
    this.strokePanel = new ColorPickerPanel(
      'Line color',
      this.language,
      properties.strokeColors,
      this.strokeColor
    );
    this.strokePanel.onColorChanged = this.strokeColorChanged;

    this.fillColor = properties.fillColor;
    this.fillPanel = new ColorPickerPanel(
      'Fill color',
      this.language,
      properties.fillColors,
      this.fillColor
    );
    this.fillPanel.onColorChanged = this.fillColorChanged;

    this.lineStyle = properties.lineStyle;
    this.lineStylePanel = new LineStylePanel(
      'Line style',
      this.language,
      'stroke-dasharray',
      properties.lineStyles,
      this.lineStyle
    );
    this.lineStylePanel.lineAttributes = [['stroke-width', '3']];
    this.lineStylePanel.onLineStyleChanged = this.lineStyleChanged;
    
    this.lineWidth = properties.lineWidth;
    this.lineWidthPanel = new LineStylePanel(
      'Line width',
      this.language,
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

    if (this.strokePanelsEnabled) {
      panelDiv.appendChild(addTitle(this.language.getString('toolbox-linecolor-title') ?? 'Line color'));
      this.strokePanel.currentColor = this.strokeColor;
      panelDiv.appendChild(this.strokePanel.getUi());
    }

    if (this.fillPanelsEnabled) {
      panelDiv.appendChild(addTitle(this.language.getString('toolbox-fillcolor-title') ?? 'Fill color'));
      this.fillPanel.currentColor = this.fillColor;
      panelDiv.appendChild(this.fillPanel.getUi());
    }

    if (this.strokePanelsEnabled) {
      panelDiv.appendChild(addTitle(this.language.getString('toolbox-linewidth-title') ?? 'Line width'));
      this.lineWidthPanel.currentStyle = this.lineWidth;
      panelDiv.appendChild(this.lineWidthPanel.getUi());
    }
    
    if (this.strokePanelsEnabled) {
      panelDiv.appendChild(addTitle(this.language.getString('toolbox-linestyle-title') ?? 'Line style'));
      this.lineStylePanel.currentStyle = this.lineStyle;
      panelDiv.appendChild(this.lineStylePanel.getUi());
    }

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
