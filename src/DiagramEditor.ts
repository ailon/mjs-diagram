import { Button, Panel, Toolbar, ToolbarBlock } from 'mjs-toolbar';
import { SvgHelper } from './SvgHelper';

export class DiagramEditor extends HTMLElement {
  private _container?: HTMLDivElement;
  private _toolbarContainer?: HTMLDivElement;
  private _contentContainer?: HTMLDivElement;
  private _toolboxContainer?: HTMLDivElement;

  private _mainCanvas?: SVGSVGElement;
  private _groupLayer?: SVGGElement;
  private _connectorLayer?: SVGGElement;
  private _objectLayer?: SVGGElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

  }

  private createLayout() {
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';

    this._container = document.createElement('div');
    this._container.style.display = 'flex';
    this._container.style.flexDirection = 'column';
    this._container.style.width = '100%';
    this._container.style.height = '100%'; 
    this._container.style.backgroundColor = 'green';

    this._toolbarContainer = document.createElement('div');
    this._toolbarContainer.style.display = 'flex';
    this._toolbarContainer.style.backgroundColor = 'red';
    this._container.appendChild(this._toolbarContainer);

    this._contentContainer = document.createElement('div');
    this._contentContainer.style.display = 'flex';
    this._contentContainer.style.flexGrow = '2';
    this._contentContainer.style.flexShrink = '1';
    this._contentContainer.style.backgroundColor = 'magenta';
    this._container.appendChild(this._contentContainer);

    this._toolboxContainer = document.createElement('div');
    this._toolboxContainer.style.display = 'flex';
    this._toolboxContainer.style.backgroundColor = 'cyan';
    this._container.appendChild(this._toolboxContainer);

    this._container.setAttribute('part','container');

    this.shadowRoot?.appendChild(this._container);  
  }

  private addToolbar() {
    const panel = <Panel>document.createElement('mjstb-panel');

    const toolbar = new Toolbar();
    toolbar.addEventListener('buttonclick', (ev) =>
      console.log(`'${ev.detail.button.command}' button clicked.`)
    );

    const block1 = new ToolbarBlock();
    const block2 = new ToolbarBlock();
    const block3 = new ToolbarBlock();

    const checkSVG = `<svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
    </svg>`;

    const button11 = new Button({ icon: checkSVG, command: 'run' });
    block1.appendButton(button11);
    const button12 = new Button({ icon: checkSVG, command: 'for' });
    block1.appendButton(button12);
    const button13 = new Button({ icon: checkSVG, command: 'cover' });
    block1.appendButton(button13);

    const button21 = new Button({ text: 'click me', command: 'text' });
    block2.appendButton(button21);
    const button22 = new Button({ icon: checkSVG });
    block2.appendButton(button22);

    toolbar.appendBlock(block1);
    toolbar.appendBlock(block2);
    toolbar.appendBlock(block3);

    panel.appendToolbar(toolbar);

    this._toolbarContainer?.appendChild(panel);
  }

  private addMainCanvas() {
    const w = this._contentContainer?.clientWidth || 0;
    const h = this._contentContainer?.clientHeight || 0;

    this._mainCanvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    this._mainCanvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this._mainCanvas.setAttribute('width', w.toString());
    this._mainCanvas.setAttribute('height', h.toString());
    this._mainCanvas.setAttribute(
      'viewBox',
      '0 0 ' + w.toString() + ' ' + h.toString()
    );
    this._mainCanvas.style.pointerEvents = 'auto';

    this._groupLayer = SvgHelper.createGroup();
    this._connectorLayer = SvgHelper.createGroup();
    this._objectLayer = SvgHelper.createGroup();

    this._mainCanvas.appendChild(this._groupLayer);
    this._mainCanvas.appendChild(this._connectorLayer);
    this._mainCanvas.appendChild(this._objectLayer);

    this._contentContainer?.appendChild(this._mainCanvas);
  }

  private connectedCallback() {
    this.createLayout();
    this.addToolbar();
    this.addMainCanvas();
    // this.attachEvents();
  }

  private disconnectedCallback() {
    // this.detachEvents();
  }  
}
