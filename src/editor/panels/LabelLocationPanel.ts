import { TextLabelLocation } from '../../core';
import { Language } from '../Language';
import { ToolboxPanelItem } from '../ToolboxPanelItem';
import { PropertyPanelBase } from './PropertyPanelBase';

/**
 * Label position change event handler type.
 */
export type LabelLocationChangeHandler = (newPosition: TextLabelLocation) => void;

/**
 * Label position toolbox panel.
 */
export class LabelLocationPanel extends PropertyPanelBase {
  private locationIcons: Map<TextLabelLocation, string> = new Map<TextLabelLocation, string>([
    ['top', '<path d="M4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4H4C2.9 4 2 4.89 2 6V18C2 19.11 2.9 20 4 20M4 11H20V18H4V11Z" />'],
    ['right', '<path d="M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V6A2 2 0 0 0 20 4M15 18H4V6H15Z" />'],
    ['bottom', '<path d="M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V6A2 2 0 0 0 20 4M20 13H4V6H20Z" />'],
    ['left', '<path d="M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V6A2 2 0 0 0 20 4M20 18H9V6H20Z" />'],
    ['hidden', '<path d="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z" />'],
  ]);
  public currentLocation?: TextLabelLocation;
  private locationBoxes: ToolboxPanelItem<TextLabelLocation>[] = [];

  /**
   * Label location change event handler.
   */
  public onLabelLocationChanged?: LabelLocationChangeHandler;

  /**
   * Creates a new label location panel.
   * @param title panel title
   * @param language language (localization) subsystem
   * @param currentLocation currently selected style
   */
  constructor(title: string, language: Language, currentLocation?: TextLabelLocation) {
    super(title, language);
    this.currentLocation = currentLocation;

    this.setCurrentLocation = this.setCurrentLocation.bind(this);
    this.getLocationBox = this.getLocationBox.bind(this);
    this.selectLocation = this.selectLocation.bind(this);
  }

  public getUi(): HTMLDivElement {
    if (this.locationBoxes.length > 0) {
      this.locationBoxes.splice(0, this.locationBoxes.length);
    }

    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.justifyContent = 'stretch';
    this.locationIcons.forEach((icon, location) => {
      const typeBox = this.getLocationBox(location, icon);
      const typeBoxUI = typeBox.getUi();
      typeBoxUI.style.stroke = '';
      typeBoxUI.style.fill = 'var(--i-mjsdiae-accent-color)';
      panelDiv.appendChild(typeBoxUI);
      this.locationBoxes.push(typeBox);
    });
    return panelDiv;
  }

  private getLocationBox(location: TextLabelLocation, icon: string): ToolboxPanelItem<TextLabelLocation> {
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
    thumbnail.setAttribute('viewBox', '0 0 24 24');
    thumbnail.innerHTML = icon;

    const typeBox = new ToolboxPanelItem<TextLabelLocation>();
    typeBox.width = buttonWidth;
    typeBox.height = buttonHeight;
    typeBox.content = thumbnail;
    typeBox.dataItem = location;
    typeBox.isSelected = location === this.currentLocation;
    typeBox.onClick = this.setCurrentLocation;

    return typeBox;
  }

  private setCurrentLocation(typeBox: ToolboxPanelItem<TextLabelLocation>) {
    this.currentLocation = typeBox.dataItem;

    this.locationBoxes.forEach((box) => {
      box.isSelected = box.dataItem === this.currentLocation;
    });

    if (this.onLabelLocationChanged && this.currentLocation !== undefined) {
      this.onLabelLocationChanged(this.currentLocation);
    }
  }

  /**
   * Selects supplied location box.
   * @param location current location to select.
   */
  public selectLocation(location: TextLabelLocation) {
    this.locationBoxes.forEach(box => {
      if (box.dataItem === location) {
        this.currentLocation = location;
        box.isSelected = true;
      } else {
        box.isSelected = false;
      }
    });
  }
}
