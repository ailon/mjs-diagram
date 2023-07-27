import { SvgHelper } from '../../core';
import { Language } from '../Language';
import { ToolboxPanelItem } from '../ToolboxPanelItem';
import { PropertyPanelBase } from './PropertyPanelBase';

/**
 * Line style change event handler type.
 */
export type LineStyleChangeHandler = (newStyle: string) => void;

/**
 * Line style toolbox panel.
 * Can be [re]used to control different line attributes.
 */
export class LineStylePanel extends PropertyPanelBase {
  /**
   * Available line styles.
   */
  public lineStyles: string[] = [];
  /**
   * Selected line style.
   */
  public currentStyle?: string;
  private typeBoxes: ToolboxPanelItem<string>[] = [];

  /**
   * Common line attributes.
   */
  public lineAttributes: Array<[string, string]> = [];
  /**
   * Panel controlled attribute name.
   */
  public lineStyleAttribute: string;

  /**
   * Line style change event handler.
   */
  public onLineStyleChanged?: LineStyleChangeHandler;

  /**
   * Creates a new line style panel.
   * @param title panel title
   * @param language language (localization) subsystem
   * @param lineStyleAttribute name of the line attribute to edit
   * @param lineStyles available styles
   * @param currentStyle currently selected style
   */
  constructor(title: string, language: Language, lineStyleAttribute: string, lineStyles: string[], currentStyle?: string) {
    super(title, language);
    this.lineStyleAttribute = lineStyleAttribute;
    this.lineStyles = lineStyles;
    this.currentStyle = currentStyle;

    this.setCurrentType = this.setCurrentType.bind(this);
    this.getTypeBox = this.getTypeBox.bind(this);
    this.selectStyle = this.selectStyle.bind(this);
  }

  public getUi(): HTMLDivElement {
    if (this.typeBoxes.length > 0) {
      this.typeBoxes.splice(0, this.typeBoxes.length);
    }

    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.justifyContent = 'stretch';
    this.lineStyles.forEach((t) => {
      const typeBox = this.getTypeBox(t);
      panelDiv.appendChild(typeBox.getUi());
      this.typeBoxes.push(typeBox);
    });
    return panelDiv;
  }

  private getTypeBox(lineStyle: string): ToolboxPanelItem<string> {
    const baseHeight = 40; // @todo: configurable
    const baseWidth = 160; // @todo: configurable

    const buttonHPadding = baseHeight / 4;
    const buttonHeight = baseHeight - buttonHPadding;
    const buttonVPadding = baseWidth / 4;
    const buttonWidth = baseWidth - buttonVPadding;

    const thumbnail = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    thumbnail.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    thumbnail.setAttribute('width', buttonWidth.toString());
    thumbnail.setAttribute('height', buttonHeight.toString());
    // thumbnail.setAttribute(
    //   'viewBox',
    //   '0 0 ' + buttonWidth.toString() + ' ' + buttonHeight.toString()
    // );
    const line = SvgHelper.createLine(
      0,
      buttonHeight / 2,
      buttonWidth,
      buttonHeight / 2,
      [
        ...this.lineAttributes,
        [this.lineStyleAttribute, lineStyle],
      ]
    );
    thumbnail.appendChild(line);

    const typeBox = new ToolboxPanelItem<string>();
    typeBox.width = buttonWidth;
    typeBox.height = buttonHeight;
    typeBox.content = thumbnail;
    typeBox.dataItem = lineStyle;
    typeBox.isSelected = lineStyle === this.currentStyle;
    typeBox.onClick = this.setCurrentType;

    return typeBox;
  }

  private setCurrentType(typeBox: ToolboxPanelItem<string>) {
    this.currentStyle = typeBox.dataItem;

    this.typeBoxes.forEach((box) => {
      box.isSelected = box.dataItem === this.currentStyle;
    });

    if (this.onLineStyleChanged && this.currentStyle !== undefined) {
      this.onLineStyleChanged(this.currentStyle);
    }
  }

  /**
   * Selects supplied style box.
   * @param style current style to select.
   */
  public selectStyle(style: string) {
    this.lineStyles.forEach((t, index) => {
      if (t === style) {
        this.currentStyle = t;
        this.typeBoxes[index].isSelected = true;
      } else {
        this.typeBoxes[index].isSelected = false;
      }
    });
  }
}
