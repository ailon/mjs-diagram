import { ConnectorBase } from '../../core/ConnectorBase';
import { Language } from '../Language';
import { ToolboxPanelItem } from '../ToolboxPanelItem';
import { PropertyPanelBase } from './PropertyPanelBase';

export type ConnectorTypeChangeHandler = (newType: typeof ConnectorBase) => void;

export class ConnectorTypePanel extends PropertyPanelBase {
  public connectorTypes: typeof ConnectorBase[] = [];
  private currentType?: typeof ConnectorBase;
  private typeBoxes: ToolboxPanelItem<typeof ConnectorBase>[] = [];

  public onConnectorTypeChanged?: ConnectorTypeChangeHandler;

  constructor(title: string, language: Language, connectorTypes: typeof ConnectorBase[], currentType?: typeof ConnectorBase) {
    super(title, language);
    this.connectorTypes = connectorTypes;
    this.currentType = currentType;

    this.setCurrentType = this.setCurrentType.bind(this);
    this.getTypeBox = this.getTypeBox.bind(this);
    this.selectType = this.selectType.bind(this);
  }

  public getUi(): HTMLDivElement {
    if (this.typeBoxes.length > 0) {
      this.typeBoxes.splice(0, this.typeBoxes.length);
    }
    
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.flexWrap = 'wrap';
    this.connectorTypes.forEach((t) => {
      const typeBox = this.getTypeBox(t);
      panelDiv.appendChild(typeBox.getUi());
      this.typeBoxes.push(typeBox);
    });
    return panelDiv;
  }

  private getTypeBox(connectorType: typeof ConnectorBase): ToolboxPanelItem<typeof ConnectorBase> {
    const baseHeight = 40; // @todo: configurable
    // const accentColor = 'red'; // @todo: configurable

    const buttonPadding = baseHeight / 4;
    const buttonHeight = baseHeight - buttonPadding;

    const thumbnail = connectorType.getThumbnail(buttonHeight - 2, buttonHeight - 2);

    const typeBox = new ToolboxPanelItem<typeof ConnectorBase>();
    typeBox.width = buttonHeight - 2;
    typeBox.height = buttonHeight - 2;
    typeBox.content = thumbnail;
    typeBox.dataItem = connectorType;
    typeBox.isSelected = connectorType === this.currentType;
    typeBox.onClick = this.setCurrentType;

    return typeBox;
  }

  private setCurrentType(typeBox: ToolboxPanelItem<typeof ConnectorBase>) {
    this.currentType = typeBox.dataItem;

    this.typeBoxes.forEach((box) => {
      box.isSelected = box.dataItem === this.currentType;
    });

    if (this.onConnectorTypeChanged && this.currentType) {
      this.onConnectorTypeChanged(this.currentType);
    }
  }

  public selectType(typeName: string) {
    this.connectorTypes.forEach((t, index) => {
      if (t.typeName === typeName) {
        this.currentType = t;
        this.typeBoxes[index].isSelected = true;
      } else {
        this.typeBoxes[index].isSelected = false;
      }
    })
  }
}
