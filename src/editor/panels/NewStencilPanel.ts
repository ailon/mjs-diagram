import { StencilBase } from '../../core/StencilBase';
import { IStencilProperties } from '../../core/StencilSet';
import { PropertyPanelBase } from './PropertyPanelBase';

export type CreateNewStencilHandler = (stencilType?: typeof StencilBase) => void;

export class NewStencilPanel extends PropertyPanelBase {
  public stencilTypes: IStencilProperties[] = [];
  private currentType?: typeof StencilBase;
  private typeBoxes: HTMLDivElement[] = [];

  public onCreateNewStencil?: CreateNewStencilHandler;

  constructor(title: string, stencilTypes: IStencilProperties[], currentType?: typeof StencilBase) {
    super(title);
    this.stencilTypes = stencilTypes;
    this.currentType = currentType;

    this.setCurrentType = this.setCurrentType.bind(this);
    this.getTypeBox = this.getTypeBox.bind(this);
    this.deselectType = this.deselectType.bind(this);
  }

  public getUi(): HTMLDivElement {
    if (this.typeBoxes.length > 0) {
      this.typeBoxes.splice(0, this.typeBoxes.length);
    }
    
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.flexWrap = 'wrap';
    panelDiv.style.color = '#ccc';
    this.stencilTypes.forEach((t) => {
      const typeBoxContainer = this.getTypeBox(t);
      panelDiv.appendChild(typeBoxContainer);
      this.typeBoxes.push(typeBoxContainer);
    });
    return panelDiv;
  }

  private getTypeBox(st: IStencilProperties): HTMLDivElement {
    const listItem = document.createElement('div');
    listItem.className = 'new-stencil-block';
    listItem.style.borderColor =
      st.stencilType === this.currentType ? 'var(--i-mjstb-accent-color)' : '#444';
    const thumbnail = st.stencilType.getThumbnail(80, 60);
    thumbnail.setAttribute('class', 'new-stencil-block-thumbnail');
    listItem.appendChild(thumbnail);
    const title = document.createElement('p');
    title.className = 'new-stencil-block-title';
    title.innerText = st.displayName ?? st.stencilType.title;
    listItem.appendChild(title);
    listItem.addEventListener('click', () => {
      this.setCurrentType(st.stencilType, listItem);
    });

    return listItem;
  }

  private setCurrentType(stencilType: typeof StencilBase, target: HTMLDivElement) {
    this.currentType = stencilType;

    this.typeBoxes.forEach((box) => {
      box.style.borderColor = box === target ? 'var(--i-mjstb-accent-color)' : '#444';
    });

    if (this.onCreateNewStencil) {
      this.onCreateNewStencil(stencilType);
    }
  }

  public deselectType() {
    this.currentType = undefined;
    this.typeBoxes.forEach((t) => {
      t.style.borderColor = '#444';
    })
  }

}
