import { SvgHelper } from '../../viewer_index';
import { ToolboxPanelItem } from '../ToolboxPanelItem';
import { PropertyPanelBase } from './PropertyPanelBase';

export type LineStyleChangeHandler = (newStyle: string) => void;

export class LineStylePanel extends PropertyPanelBase {
  public lineStyles: string[] = [];
  public currentStyle?: string;
  private typeBoxes: ToolboxPanelItem<string>[] = [];

  public onLineStyleChanged?: LineStyleChangeHandler;

  constructor(title: string, lineStyles: string[], currentStyle?: string) {
    super(title);
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
    panelDiv.style.flexWrap = 'wrap';
    this.lineStyles.forEach((t) => {
      const typeBox = this.getTypeBox(t);
      panelDiv.appendChild(typeBox.getUi());
      this.typeBoxes.push(typeBox);
    });
    return panelDiv;
  }

  private getTypeBox(lineStyle: string): ToolboxPanelItem<string> {
    const baseHeight = 40; // @todo: configurable
    const baseWidth = 60; // @todo: configurable

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
    thumbnail.setAttribute(
      'viewBox',
      '0 0 ' + buttonWidth.toString() + ' ' + buttonHeight.toString()
    );
    const line = SvgHelper.createLine(
      3,
      buttonHeight / 2,
      buttonWidth - 3,
      buttonHeight / 2,
      [
        ['stroke-width', '3'],
        ['stroke-dasharray', lineStyle],
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

    if (this.onLineStyleChanged && this.currentStyle) {
      this.onLineStyleChanged(this.currentStyle);
    }
  }

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
