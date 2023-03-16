export type ToolboxPanelItemClickHandler<T> = (panelItem: ToolboxPanelItem<T>) => void;

export class ToolboxPanelItem<T> {
  public content?: HTMLElement | SVGSVGElement;
  public key?: string;
  public width = 0;
  public height = 0;
  private _isSelected = false;
  public get isSelected(): boolean {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    this._isSelected = value;
    if (this.itemUi !== undefined) {
      this.itemUi.style.borderColor =
        this.isSelected ? 'var(--i-mjstb-accent-color)' : '#444';
    }
  }
  public dataItem?: T;

  private itemUi?: HTMLDivElement;

  public onClick?: ToolboxPanelItemClickHandler<T>;

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
    this.itemUi.addEventListener('click', () => {
      if (this.onClick !== undefined) {
        this.onClick(this);
      }
    });
  }

  public getUi(): HTMLElement {
    if (this.itemUi === undefined) {
      this.setupUi();
    }
    if (this.itemUi !== undefined) {
      this.itemUi.style.width = `${this.width}px`;
      this.itemUi.style.height = `${this.height}px`;
      this.itemUi.style.borderColor =
        this.isSelected ? 'var(--i-mjstb-accent-color)' : '#444';
      this.itemUi.style.stroke = 'var(--i-mjstb-accent-color)';
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.itemUi!;
  }
}