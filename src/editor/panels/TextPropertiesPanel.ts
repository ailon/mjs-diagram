import { FontSize } from "../../core";
import { FontFamily } from "../FontFamily";
import { ColorSet } from "../ColorSet";
import { ColorChangeHandler, ColorPickerPanel } from "./ColorPickerPanel";
import { FontFamilyChangeHandler, FontPanel, FontSizeChangeHandler } from "./FontPanel";
import { PropertyPanelBase } from "./PropertyPanelBase";
import { Language } from "../Language";

/**
 * Text properties panel controlled properties.
 */
export interface TextPropertiesPanelProperties {
  /**
   * Available text colors.
   */
  textColors: ColorSet,
  /**
   * Selected text color.
   */
  textColor?: string,
  /**
   * Available font families.
   */
  fontFamilies: FontFamily[],
  /**
   * Selected font family.
   */
  fontFamily?: string,
  /**
   * Current font size.
   */
  fontSize?: FontSize
}

/**
 * Toolbox meta-panel for text properties.
 */
export class TextPropertiesPanel extends PropertyPanelBase {
  private colorPanel: ColorPickerPanel;
  private fontPanel: FontPanel;

  /**
   * Font color change event handler.
   */
  public onColorChanged?: ColorChangeHandler;
  /**
   * Font family change event handler.
   */
  public onFontFamilyChanged?: FontFamilyChangeHandler;
  /**
   * Font size change event handler.
   */
  public onFontSizeChanged?: FontSizeChangeHandler;

  /**
   * Current text color.
   */
  public textColor?: string;
  /**
   * Current font family.
   */
  public fontFamily?: string;
  /**
   * Current font size.
   */
  public fontSize?: FontSize;

  /**
   * Creates a new text properties panel.
   * @param title panel title
   * @param language language (localization) subsystem
   * @param properties panel properties
   */
  constructor(title: string, language: Language, properties: TextPropertiesPanelProperties) {
    super(title, language);

    this.colorChanged = this.colorChanged.bind(this);
    this.fontFamilyChanged = this.fontFamilyChanged.bind(this);
    this.fontSizeChanged = this.fontSizeChanged.bind(this);

    this.textColor = properties.textColor;
    this.colorPanel = new ColorPickerPanel(
      'Color',
      this.language,
      properties.textColors,
      this.textColor
    );
    this.colorPanel.onColorChanged = this.colorChanged;

    this.fontFamily = properties.fontFamily;
    this.fontPanel = new FontPanel(
      'Font',
      this.language,
      properties.fontFamilies,
      this.fontFamily,
      this.fontSize
    );
    this.fontPanel.onFontFamilyChanged = this.fontFamilyChanged;
    this.fontPanel.onFontSizeChanged = this.fontSizeChanged;


  }

  public getUi(): HTMLDivElement {
    function addTitle(text: string): HTMLHeadingElement {
      const title = document.createElement('h3');
      title.innerText = text;
      return title;
    }

    const panelDiv = document.createElement('div');

    panelDiv.appendChild(addTitle(this.language.getString('toolbox-textcolor-title') ?? 'Text color'));
    this.colorPanel.currentColor = this.textColor;
    panelDiv.appendChild(this.colorPanel.getUi());

    panelDiv.appendChild(addTitle(this.language.getString('toolbox-font-title') ?? 'Font'));
    this.fontPanel.currentFontFamily = this.fontFamily;
    if (this.fontSize !== undefined) {
      this.fontPanel.currentFontSize = this.fontSize;
    }
    panelDiv.appendChild(this.fontPanel.getUi());

    return panelDiv;
  }

  private colorChanged(newColor: string) {
    if (this.onColorChanged) {
      this.onColorChanged(newColor);
    }
  }

  private fontFamilyChanged(newFontFamily: string) {
    if (this.onFontFamilyChanged) {
      this.onFontFamilyChanged(newFontFamily);
    }
  }
  private fontSizeChanged(newFontSize: FontSize) {
    if (this.onFontSizeChanged) {
      this.onFontSizeChanged(newFontSize);
    }
  }
}
