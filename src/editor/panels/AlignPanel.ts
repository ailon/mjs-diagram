import { Language } from "../Language";
import { PropertyPanelBase } from "./PropertyPanelBase";

/**
 * Horizontal alignment options.
 */
export type HorizontalAlignment = 'left' | 'center' | 'right';
/**
 * Vertical alignment options.
 */
export type VerticalAlignment = 'top' | 'middle' | 'bottom';

/**
 * Horizontal alignment change event handler type.
 */
export type HorizontalAlignmentClickHandler = (alignment: HorizontalAlignment) => void;
/**
 * Vertical alignment change event handler type.
 */
export type VerticalAlignmentClickHandler = (alignment: VerticalAlignment) => void;

/**
 * Toolbox panel for editing object and text alignment.
 */
export class AlignPanel extends PropertyPanelBase {
  /**
   * Horizontal alignmen change event handler.
   */
  public onHorizontalAlignmentClicked?: HorizontalAlignmentClickHandler;
  /**
   * Vertical alignment change event handler.
   */
  public onVerticalAlignmentClicked?: VerticalAlignmentClickHandler;

  /**
   * {@inheritDoc editor!PropertyPanelBase.constructor}
   */
  constructor(title: string, language: Language) {
    super(title, language);

    this.horizontalAlignmentClicked = this.horizontalAlignmentClicked.bind(this);
    this.verticalAlignmentClicked = this.verticalAlignmentClicked.bind(this);
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

    // const hTitle = document.createElement('h3');
    // hTitle.innerText = this.language.getString('toolbox-horizontal-align-title') ?? 'Align horizontally';
    // panelDiv.appendChild(hTitle);

    const hPanel = document.createElement('div');
    hPanel.style.display = 'flex';
    hPanel.style.marginRight = '5px';
    panelDiv.appendChild(hPanel);

    const leftButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M4 22H2V2H4V22M22 7H6V10H22V7M16 14H6V17H16V14Z" /></svg>',
      this.language.getString('toolbox-align-left') ?? 'Left'
    );
    leftButton.addEventListener('click', () => this.horizontalAlignmentClicked('left'));
    hPanel.appendChild(leftButton);

    const centerButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M11 2H13V7H21V10H13V14H18V17H13V22H11V17H6V14H11V10H3V7H11V2Z" /></svg>',
      this.language.getString('toolbox-align-center') ?? 'Center'
    );
    centerButton.addEventListener('click', () => this.horizontalAlignmentClicked('center'));
    hPanel.appendChild(centerButton);

    const rightButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H22V22H20V2M2 10H18V7H2V10M8 17H18V14H8V17Z" /></svg>',
      this.language.getString('toolbox-align-right') ?? 'Right'
    );
    rightButton.addEventListener('click', () => this.horizontalAlignmentClicked('right'));
    hPanel.appendChild(rightButton);

    // const vTitle = document.createElement('h3');
    // vTitle.innerText = this.language.getString('toolbox-vertical-align-title') ?? 'Align vertically';
    // panelDiv.appendChild(vTitle);    

    const vPanel = document.createElement('div');
    vPanel.style.display = 'flex';
    panelDiv.appendChild(vPanel);

    const topButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M22 2V4H2V2H22M7 22H10V6H7V22M14 16H17V6H14V16Z" /></svg>',
      this.language.getString('toolbox-align-top') ?? 'Top'
    );
    topButton.addEventListener('click', () => this.verticalAlignmentClicked('top'));
    vPanel.appendChild(topButton);

    const middleButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M22 11H17V6H14V11H10V3H7V11H1.8V13H7V21H10V13H14V18H17V13H22V11Z" /></svg>',
      this.language.getString('toolbox-align-middle') ?? 'Middle'
    );
    middleButton.addEventListener('click', () => this.verticalAlignmentClicked('middle'));
    vPanel.appendChild(middleButton);

    const bottomButton = getButton(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M22 22H2V20H22V22M10 2H7V18H10V2M17 8H14V18H17V8Z" /></svg>',
      this.language.getString('toolbox-align-right') ?? 'Right'
    );
    bottomButton.addEventListener('click', () => this.verticalAlignmentClicked('bottom'));
    vPanel.appendChild(bottomButton);

    return panelDiv;
  }  

  private horizontalAlignmentClicked(align: HorizontalAlignment): void {
    if (this.onHorizontalAlignmentClicked) {
      this.onHorizontalAlignmentClicked(align);
    }
  }
  private verticalAlignmentClicked(align: VerticalAlignment): void {
    if (this.onVerticalAlignmentClicked) {
      this.onVerticalAlignmentClicked(align);
    }
  }
}