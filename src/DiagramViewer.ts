import { ConnectorBase } from './ConnectorBase';
import { DiagramState } from './DiagramState';
import { IPoint } from './IPoint';
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';
import { TextStencil } from './TextStencil';

export class DiagramViewer extends HTMLElement {
  private _container?: HTMLDivElement;

  private _mainCanvas?: SVGSVGElement;
  private _groupLayer?: SVGGElement;
  private _connectorLayer?: SVGGElement;
  private _objectLayer?: SVGGElement;

  private _stencils: StencilBase[] = [];

  private _connectors: ConnectorBase[] = [];

  public zoomSteps = [1, 1.5, 2, 4];
  private _zoomLevel = 1;
  public get zoomLevel(): number {
    return this._zoomLevel;
  }
  public set zoomLevel(value: number) {
    this._zoomLevel = value;
    // @todo
    // if (this.editorCanvas && this.contentDiv) {
    //   this.editorCanvas.style.transform = `scale(${this._zoomLevel})`;
    //   this.contentDiv.scrollTo({
    //     left:
    //       (this.editorCanvas.clientWidth * this._zoomLevel -
    //         this.contentDiv.clientWidth) /
    //       2,
    //     top:
    //       (this.editorCanvas.clientHeight * this._zoomLevel -
    //         this.contentDiv.clientHeight) /
    //       2,
    //   });
    // }
  }

  private _availableStencilTypes: typeof StencilBase[] = [ StencilBase, TextStencil ];
  private _availableConnectorTypes: typeof ConnectorBase[] = [ ConnectorBase ];

  constructor() {
    super();

    this.onPointerDown = this.onPointerDown.bind(this);
    //this.onDblClick = this.onDblClick.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onStencilPointerUp = this.onStencilPointerUp.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);
    //this.onKeyUp = this.onKeyUp.bind(this);
    //this.overrideOverflow = this.overrideOverflow.bind(this);
    //this.restoreOverflow = this.restoreOverflow.bind(this);
    //this.close = this.close.bind(this);
    //this.closeUI = this.closeUI.bind(this);
    this.clientToLocalCoordinates = this.clientToLocalCoordinates.bind(this);
    // this.onWindowResize = this.onWindowResize.bind(this);

    this.attachShadow({ mode: 'open' });
  }

  private _iid = 0;
  public getNewIId(): number {
    return ++this._iid;
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

    this._container.setAttribute('part', 'container');

    this.shadowRoot?.appendChild(this._container);
  }

  private width = 0;
  private height = 0;

  private addMainCanvas() {
    this.width = this._container?.clientWidth || 0;
    this.height = this._container?.clientHeight || 0;

    this._mainCanvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    this._mainCanvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this._mainCanvas.setAttribute('width', this.width.toString());
    this._mainCanvas.setAttribute('height', this.height.toString());
    this._mainCanvas.setAttribute(
      'viewBox',
      '0 0 ' + this.width.toString() + ' ' + this.height.toString()
    );
    this._mainCanvas.style.pointerEvents = 'auto';

    this._groupLayer = SvgHelper.createGroup();
    this._connectorLayer = SvgHelper.createGroup();
    this._objectLayer = SvgHelper.createGroup();

    this._mainCanvas.appendChild(this._groupLayer);
    this._mainCanvas.appendChild(this._connectorLayer);
    this._mainCanvas.appendChild(this._objectLayer);

    this._container?.appendChild(this._mainCanvas);
  }

  private connectedCallback() {
    this.createLayout();
    this.addMainCanvas();
    this.attachEvents();
  }

  private disconnectedCallback() {
    this.detachEvents();
  }

  private attachEvents() {
    this._mainCanvas?.addEventListener('pointerdown', this.onPointerDown);
    this._mainCanvas?.addEventListener('pointerup', this.onStencilPointerUp);
    // @todo
    // this._mainCanvas?.addEventListener('dblclick', this.onDblClick);
    this.attachWindowEvents();
  }

  private attachWindowEvents() {
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerOut);
    window.addEventListener('pointerout', this.onPointerOut);
    window.addEventListener('pointerleave', this.onPointerUp);
    // @todo
    // window.addEventListener('resize', this.onWindowResize);
    // window.addEventListener('keyup', this.onKeyUp);
  }

  private detachEvents() {
    this._mainCanvas?.removeEventListener('pointerdown', this.onPointerDown);
    this._mainCanvas?.removeEventListener('pointerdown', this.onStencilPointerUp);
    // @todo
    // this._mainCanvas?.removeEventListener('dblclick', this.onDblClick);
    this.detachWindowEvents();
  }

  private detachWindowEvents() {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerOut);
    window.removeEventListener('pointerout', this.onPointerOut);
    window.removeEventListener('pointerleave', this.onPointerUp);
    // @todo
    // window.removeEventListener('resize', this.onWindowResize);
    // window.removeEventListener('keyup', this.onKeyUp);
  }

  private clientToLocalCoordinates(x: number, y: number): IPoint {
    if (this._mainCanvas) {
      const clientRect = this._mainCanvas.getBoundingClientRect();
      return {
        x: (x - clientRect.left) / this.zoomLevel,
        y: (y - clientRect.top) / this.zoomLevel,
      };
    } else {
      return { x: x, y: y };
    }
  }

  private touchPoints = 0;
  private isDragging = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPointerDown(ev: PointerEvent) {
    // @todo
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPointerMove(ev: PointerEvent) {
    // @todo
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onStencilPointerUp(ev: PointerEvent) {
    // @todo
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPointerUp(ev: PointerEvent) {
    // @todo
  }

  private onPointerOut(/*ev: PointerEvent*/) {
    // @todo
  }

  private addNewStencil(stencilType: typeof StencilBase): StencilBase {
    const g = SvgHelper.createGroup();
    this._objectLayer?.appendChild(g);

    return new stencilType(
      this.getNewIId(),
      g,
    );
  }

  private addNewConnector(connectorType: typeof ConnectorBase): ConnectorBase {
    const g = SvgHelper.createGroup();
    this._connectorLayer?.appendChild(g);

    return new connectorType(
      this.getNewIId(),
      g
    );
  }

  public show(state: DiagramState): void {
    this._stencils.splice(0);
    while (this._objectLayer?.lastChild) {
      this._objectLayer.removeChild(this._objectLayer.lastChild);
    }
    this._connectors.splice(0);
    while (this._connectorLayer?.lastChild) {
      this._connectorLayer.removeChild(this._connectorLayer.lastChild);
    }

    state.stencils.forEach((stencilState) => {
      const stencilType = this._availableStencilTypes.find(
        (sType) => sType.typeName === stencilState.typeName
      );
      if (stencilType !== undefined) {
        const stencil = this.addNewStencil(stencilType);
        stencil.restoreState(stencilState);
        this._stencils.push(stencil);
      }
    });    

    state.connectors.forEach((conState) => {
      const conType = this._availableConnectorTypes.find(
        (cType) => cType.typeName === conState.typeName
      );
      if (conType !== undefined) {
        const startStencil = this._stencils.find(s => s.IId === conState.startStencilId);
        const endStencil = this._stencils.find(s => s.IId === conState.endStencilId);

        if (startStencil && endStencil && conState.startPortLocation && conState.endPortLocation) {
          const startPort = startStencil.ports.get(conState.startPortLocation);
          const endPort = endStencil.ports.get(conState.endPortLocation);

          if (startPort && endPort) {
            const connector = this.addNewConnector(conType);
            connector.restoreState(conState, {
              startStencil: startStencil,
              startPort: startPort,
              endStencil: endStencil,
              endPort: endPort
            });
            this._connectors.push(connector);
            startPort.connectors.push(connector);
            endPort.connectors.push(connector);
          }
        }
      }
    });    

  }
}
