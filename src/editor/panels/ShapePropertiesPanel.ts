import { ColorSet } from '../ColorSet';
import { Language } from '../Language';
import { ColorChangeHandler, ColorPickerPanel } from './ColorPickerPanel';
import { LineStyleChangeHandler, LineStylePanel } from './LineStylePanel';
import { PropertyPanelBase } from './PropertyPanelBase';

/**
 * Shape panel controlled properties.
 */
export interface ShapePropertiesPanelProperties {
  /**
   * Available fill colors.
   */
  fillColors: ColorSet;
  /**
   * Selected fill color.
   */
  fillColor?: string;
  /**
   * Available stroke colors.
   */
  strokeColors: ColorSet;
  /**
   * Selected stroke color.
   */
  strokeColor?: string;
  /**
   * Available line styles.
   */
  lineStyles: string[];
  /**
   * Selected line style.
   */
  lineStyle?: string;
  /**
   * Available line widths.
   */
  lineWidths: string[];
  /**
   * Current line width.
   */
  lineWidth: string;
}

/**
 * Toolbox meta-panel for editing shape properties.
 */
export class ShapePropertiesPanel extends PropertyPanelBase {
  private strokePanel: ColorPickerPanel;
  private fillPanel: ColorPickerPanel;
  private lineStylePanel: LineStylePanel;
  private lineWidthPanel: LineStylePanel;

  /**
   * Stroke color change event handler.
   */
  public onStrokeColorChanged?: ColorChangeHandler;
  /**
   * Fill color change event handler.
   */
  public onFillColorChanged?: ColorChangeHandler;
  /**
   * Line style change event handler.
   */
  public onLineStyleChanged?: LineStyleChangeHandler;
  /**
   * Line width change event handler.
   */
  public onLineWidthChanged?: LineStyleChangeHandler;

  /**
   * Current stroke color.
   */
  public strokeColor?: string;
  /**
   * Current fill color.
   */
  public fillColor?: string;
  /**
   * Current line style.
   */
  public lineStyle?: string;
  /**
   * Current line width.
   */
  public lineWidth?: string;

  /**
   * If set to `false` the fill related panels are hidden.
   */
  public fillPanelsEnabled = true;
  /**
   * If set to 'false` the stroke related panels are hidden.
   */
  public strokePanelsEnabled = true;

  /**
   * Creates a shape properties panel.
   * @param title panel title
   * @param language language (localization) subsystem
   * @param properties panel properties
   */
  constructor(
    title: string,
    language: Language,
    properties: ShapePropertiesPanelProperties
  ) {
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
      panelDiv.appendChild(
        addTitle(
          this.language.getString('toolbox-linecolor-title') ?? 'Line color'
        )
      );
      this.strokePanel.currentColor = this.strokeColor;
      panelDiv.appendChild(this.strokePanel.getUi());
    }

    if (this.fillPanelsEnabled) {
      panelDiv.appendChild(
        addTitle(
          this.language.getString('toolbox-fillcolor-title') ?? 'Fill color'
        )
      );
      this.fillPanel.currentColor = this.fillColor;
      panelDiv.appendChild(this.fillPanel.getUi());
    }

    if (this.strokePanelsEnabled) {
      panelDiv.appendChild(
        addTitle(
          this.language.getString('toolbox-linewidth-title') ?? 'Line width'
        )
      );
      this.lineWidthPanel.currentStyle = this.lineWidth;
      panelDiv.appendChild(this.lineWidthPanel.getUi());
    }

    if (this.strokePanelsEnabled) {
      panelDiv.appendChild(
        addTitle(
          this.language.getString('toolbox-linestyle-title') ?? 'Line style'
        )
      );
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
