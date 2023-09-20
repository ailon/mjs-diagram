import { Language } from "../Language";
import { PropertyPanelBase } from "./PropertyPanelBase";

/**
 * Arrangement options.
 */
export type ArrangementType = 'front' | 'forward' | 'backward' | 'back';

/**
 * Arrange event handler type.
 */
export type ArrangeClickHandler = (arrange: ArrangementType) => void;

/**
 * Object arrangemen panel.
 */
export class ArrangePanel extends PropertyPanelBase {
  /**
   * Handler for the arrange event.
   */
  public onArrangeClicked?: ArrangeClickHandler;

  /**
   * {@inheritDoc editor!PropertyPanelBase.constructor}
   */
  constructor(title: string, language: Language) {
    super(title, language);

    this.arrangeClicked = this.arrangeClicked.bind(this);
  }

  public getUi(): HTMLDivElement {
    function getButton(innerHTML: string, title: string): HTMLButtonElement {
      const button = document.createElement('button');
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.width = '24px';
      button.style.height = '24px';
      button.style.padding = '3px';
      button.innerHTML = innerHTML;
      button.title = title;
      return button;
    }

    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';

    const frontButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M2,2H11V6H9V4H4V9H6V11H2V2M22,13V22H13V18H15V20H20V15H18V13H22M8,8H16V16H8V8Z" /></svg>',
      this.language.getString('toolbox-arrange-front') ?? 'Bring to front'
    );
    frontButton.addEventListener('click', () => this.arrangeClicked('front'));
    panelDiv.appendChild(frontButton);

    const forwardButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M2,2H16V16H2V2M22,8V22H8V18H10V20H20V10H18V8H22Z" /></svg>',
      this.language.getString('toolbox-arrange-forward') ?? 'Bring forward'
    );
    forwardButton.addEventListener('click', () => this.arrangeClicked('forward'));
    panelDiv.appendChild(forwardButton);

    const backwardButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M2,2H16V16H2V2M22,8V22H8V18H18V8H22M4,4V14H14V4H4Z" /></svg>',
      this.language.getString('toolbox-arrange-backward') ?? 'Send backward'
    );
    backwardButton.addEventListener('click', () => this.arrangeClicked('backward'));
    panelDiv.appendChild(backwardButton);

    const backButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M2,2H11V11H2V2M9,4H4V9H9V4M22,13V22H13V13H22M15,20H20V15H15V20M16,8V11H13V8H16M11,16H8V13H11V16Z" /></svg>',
      this.language.getString('toolbox-arrange-back') ?? 'Send to back'
    );
    backButton.addEventListener('click', () => this.arrangeClicked('back'));
    panelDiv.appendChild(backButton);

    return panelDiv;
  }  

  private arrangeClicked(arrange: ArrangementType): void {
    if (this.onArrangeClicked) {
      this.onArrangeClicked(arrange);
    }
  }
}
