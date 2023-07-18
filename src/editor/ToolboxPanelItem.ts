/**
 * Toolbox panel item click handler type.
 */
export type ToolboxPanelItemClickHandler<T> = (panelItem: ToolboxPanelItem<T>) => void;

/**
 * Represents a single generic item in a toolbox panel.
 */
export class ToolboxPanelItem<T> {
  /**
   * UI content of the item.
   */
  public content?: HTMLElement | SVGSVGElement;
  /**
   * Item's identifier.
   */
  public key?: string;
  /**
   * Item width.
   */
  public width = 0;
  /**
   * Item height.
   */
  public height = 0;
  private _isSelected = false;
  /**
   * Returns true if the item is currently selected.
   */
  public get isSelected(): boolean {
    return this._isSelected;
  }
  /**
   * Selects or deselects the toolbox item.
   */
  public set isSelected(value: boolean) {
    this._isSelected = value;
    if (this.itemUi !== undefined) {
      this.itemUi.style.borderColor =
        this.isSelected ? 'var(--i-mjsdiae-accent-color)' : 'var(--i-mjsdiae-background-color)';
    }
  }
  /**
   * Data item associated with this toolbox item.
   */
  public dataItem?: T;

  private itemUi?: HTMLDivElement;

  /**
   * Click event handler.
   */
  public onClick?: ToolboxPanelItemClickHandler<T>;

  /**
   * Creates a new toolbox panel item instance.
   */
  constructor() {
    this.getUi = this.getUi.bind(this);
  }

  private setupUi() {
    this.itemUi = document.createElement('div');
    if (this.content !== undefined) {
      this.itemUi.appendChild(this.content);
    }
    this.itemUi.style.display = 'flex';
    this.itemUi.style.borderWidth = '2px';
    this.itemUi.style.borderStyle = 'solid';
    this.itemUi.style.flexGrow = '1';
    this.itemUi.style.padding = '0 3px';
    this.itemUi.addEventListener('click', () => {
      if (this.onClick !== undefined) {
        this.onClick(this);
      }
    });
  }

  /**
   * Returns item's UI.
   * @returns UI as an HTML element.
   */
  public getUi(): HTMLElement {
    if (this.itemUi === undefined) {
      this.setupUi();
    }
    if (this.itemUi !== undefined) {
      this.itemUi.style.maxWidth = `${this.width}px`;
      this.itemUi.style.minWidth = `20px`;
      this.itemUi.style.overflow = `hidden`;
      this.itemUi.style.height = `${this.height}px`;
      this.itemUi.style.borderColor =
        this.isSelected ? 'var(--i-mjsdiae-accent-color)' : 'var(--i-mjsdiae-background-color)';
      this.itemUi.style.stroke = 'var(--i-mjsdiae-accent-color)';
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.itemUi!;
  }
}
