import { ConnectorBase } from '../../core/ConnectorBase';
import { PropertyPanelBase } from './PropertyPanelBase';

export type ConnectorTypeChangeHandler = (newType: typeof ConnectorBase) => void;

export class ConnectorTypePanel extends PropertyPanelBase {
  public connectorTypes: typeof ConnectorBase[] = [];
  private currentType?: typeof ConnectorBase;
  private typeBoxes: HTMLDivElement[] = [];

  public onConnectorTypeChanged?: ConnectorTypeChangeHandler;

  constructor(title: string, connectorTypes: typeof ConnectorBase[], currentType?: typeof ConnectorBase) {
    super(title);
    this.connectorTypes = connectorTypes;
    this.currentType = currentType;

    this.setCurrentType = this.setCurrentType.bind(this);
    this.getTypeBox = this.getTypeBox.bind(this);
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.flexWrap = 'wrap';
    this.connectorTypes.forEach((t) => {
      const typeBoxContainer = this.getTypeBox(t);
      panelDiv.appendChild(typeBoxContainer);
      this.typeBoxes.push(typeBoxContainer);
    });
    return panelDiv;
  }

  private getTypeBox(connectorType: typeof ConnectorBase): HTMLDivElement {
    const baseHeight = 40; // @todo: configurable
    // const accentColor = 'red'; // @todo: configurable

    const buttonPadding = baseHeight / 4;
    const buttonHeight = baseHeight - buttonPadding;

    const thumbnail = connectorType.getThumbnail(buttonHeight - 2, buttonHeight - 2);

    const typeBox = document.createElement('div');
    typeBox.appendChild(thumbnail);
    typeBox.style.display = 'flex';
    typeBox.style.width = `${buttonHeight - 2}px`;
    typeBox.style.height = `${buttonHeight - 2}px`;
    typeBox.style.borderWidth = '2px';
    typeBox.style.borderStyle = 'solid';
    typeBox.style.borderColor =
      connectorType === this.currentType ? 'var(--i-mjstb-accent-color)' : '#444';
    typeBox.style.stroke = 'var(--i-mjstb-accent-color)';
    typeBox.addEventListener('click', () => {
      this.setCurrentType(connectorType, typeBox);
    });

    return typeBox;
  }

  private setCurrentType(connectorType: typeof ConnectorBase, target: HTMLDivElement) {
    this.currentType = connectorType;

    this.typeBoxes.forEach((box) => {
      box.style.borderColor = box === target ? 'var(--i-mjstb-accent-color)' : '#444';
    });

    if (this.onConnectorTypeChanged) {
      this.onConnectorTypeChanged(connectorType);
    }
  }
}
