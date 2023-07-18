import { StencilBase } from '../../core';
import { IStencilProperties } from '../../core';
import { Language } from '../Language';
import { PropertyPanelBase } from './PropertyPanelBase';

/**
 * New stencil type selected event handler type.
 */
export type CreateNewStencilHandler = (stencilType?: typeof StencilBase) => void;

/**
 * Toolbox panel displaying available stencil types.
 */
export class NewStencilPanel extends PropertyPanelBase {
  /**
   * Available stencil types.
   */
  public stencilTypes: IStencilProperties[] = [];
  private currentType?: typeof StencilBase;
  private typeBoxes: HTMLDivElement[] = [];

  /**
   * New type selected event handler.
   */
  public onCreateNewStencil?: CreateNewStencilHandler;

  /**
   * Creates a new stencil toolbox panel.
   * @param title panel title
   * @param language language (localization) subsystem
   * @param stencilTypes available stencil types
   * @param currentType selected stencil type
   */
  constructor(title: string, language: Language, stencilTypes: IStencilProperties[], currentType?: typeof StencilBase) {
    super(title, language);
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
      st.stencilType === this.currentType ? 'var(--i-mjsdiae-accent-color)' : 'var(--i-mjsdiae-panel-separator-color)';
    const thumbnail = st.stencilType.getThumbnail(80, 60);
    thumbnail.setAttribute('class', 'new-stencil-block-thumbnail');
    listItem.appendChild(thumbnail);
    const title = document.createElement('p');
    title.className = 'new-stencil-block-title';
    title.innerText = st.displayName ?? st.stencilType.title;
    title.title = title.innerText;
    listItem.appendChild(title);
    listItem.addEventListener('pointerdown', () => {
      this.setCurrentType(st.stencilType, listItem);
    });

    return listItem;
  }

  private setCurrentType(stencilType: typeof StencilBase, target: HTMLDivElement) {
    this.currentType = stencilType;

    this.typeBoxes.forEach((box) => {
      box.style.borderColor = box === target ? 'var(--i-mjsdiae-accent-color)' : 'var(--i-mjsdiae-panel-separator-color)';
    });

    if (this.onCreateNewStencil) {
      this.onCreateNewStencil(stencilType);
    }
  }

  /**
   * Deselects selected stencil type.
   */
  public deselectType() {
    this.currentType = undefined;
    this.typeBoxes.forEach((t) => {
      t.style.borderColor = 'var(--i-mjsdiae-panel-separator-color)';
    })
  }

}
