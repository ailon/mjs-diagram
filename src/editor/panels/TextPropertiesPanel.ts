import { FontSize } from "../../core/FontSize";
import { FontFamily } from "../FontFamily";
import { ColorSet } from "../ColorSet";
import { ColorChangeHandler, ColorPickerPanel } from "./ColorPickerPanel";
import { FontFamilyChangeHandler, FontPanel, FontSizeChangeHandler } from "./FontPanel";
import { PropertyPanelBase } from "./PropertyPanelBase";
import { Language } from "../Language";

export interface TextPropertiesPanelProperties {
  textColors: ColorSet,
  textColor?: string,
  fontFamilies: FontFamily[],
  fontFamily?: string,
  fontSize?: FontSize
}

export class TextPropertiesPanel extends PropertyPanelBase {
  private colorPanel: ColorPickerPanel;
  private fontPanel: FontPanel;

  public onColorChanged?: ColorChangeHandler;
  public onFontFamilyChanged?: FontFamilyChangeHandler;
  public onFontSizeChanged?: FontSizeChangeHandler;

  public textColor?: string;
  public fontFamily?: string;
  public fontSize?: FontSize;

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
