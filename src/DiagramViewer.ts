import { basicStencilSet } from './core/BasicStencilSet';
import { ConnectorBase } from './core/ConnectorBase';
import { DiagramState } from './core/DiagramState';
import { IPoint } from './core/IPoint';
import { StencilBase } from './core/StencilBase';
import { SvgHelper } from './core/SvgHelper';

import Logo from './assets/markerjs-logo-m.svg';
import { Activator } from './core/Activator';

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

  private _stencilSet = basicStencilSet;
  public get stencilSet() {
    return this._stencilSet;
  }
  public set stencilSet(value) {
    this._stencilSet = value;
    if (!Activator.isLicensed('MJSDV')) {
      // NOTE:
      // before removing this call please consider supporting marker.js
      // by visiting https://markerjs.com/ for details
      // thank you!
      this.addLogo();
    } else {
      this.removeLogo();
    }
  }

  constructor() {
    super();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onStencilPointerUp = this.onStencilPointerUp.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);
    this.clientToLocalCoordinates = this.clientToLocalCoordinates.bind(this);

    this.addLogo = this.addLogo.bind(this);
    this.removeLogo = this.removeLogo.bind(this);
    this.positionLogo = this.positionLogo.bind(this);

    this.show = this.show.bind(this);
    this.setDocumentBgColor = this.setDocumentBgColor.bind(this);

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
    this._container.style.position = 'relative';
    this._container.style.display = 'flex';
    this._container.style.flexDirection = 'column';
    this._container.style.width = '100%';
    this._container.style.height = '100%';
    this._container.style.backgroundColor = '#fff';

    this._container.setAttribute('part', 'container');

    this.shadowRoot?.appendChild(this._container);
  }

  private width = 0;
  private height = 0;

  private documentWidth = 640;
  private documentHeight = 360;
  private documentBgColor = 'white';

  private addMainCanvas() {
    this.width = this._container?.clientWidth || 0;
    this.height = this._container?.clientHeight || 0;

    this._mainCanvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    this._mainCanvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.setMainCanvasSize();
    this._mainCanvas.style.pointerEvents = 'auto';
    
    this._mainCanvas.style.fontFamily = 'Helvetica, Arial, Sans-Serif';
    this._mainCanvas.style.backgroundColor = this.documentBgColor;

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
    this._mainCanvas?.removeEventListener(
      'pointerdown',
      this.onStencilPointerUp
    );
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

    return new stencilType(this.getNewIId(), g);
  }

  private addNewConnector(connectorType: typeof ConnectorBase): ConnectorBase {
    const g = SvgHelper.createGroup();
    this._connectorLayer?.appendChild(g);

    return new connectorType(this.getNewIId(), g);
  }

  private setDocumentBgColor(color: string) {
    this.documentBgColor = color;
    if (this._mainCanvas !== undefined) {
      this._mainCanvas.style.backgroundColor = color;
    }
  }

  private setMainCanvasSize() {
    if (this._mainCanvas !== undefined) {
      this._mainCanvas.setAttribute('width', this.documentWidth.toString());
      this._mainCanvas.setAttribute('height', this.documentHeight.toString());
      this._mainCanvas.setAttribute(
        'viewBox',
        '0 0 ' +
        this.documentWidth.toString() +
        ' ' +
        this.documentHeight.toString()
      );
      this.zoomLevel = this.zoomLevel * 1;
    }
  }

  private setDocumentSize(width: number, height: number) {
    this.documentWidth = width;
    this.documentHeight = height;
    this.setMainCanvasSize();
  }

  public show(state: DiagramState): void {
    this.setDocumentSize(state.width, state.height);
    if (state.backgroundColor !== undefined) {
      this.setDocumentBgColor(state.backgroundColor);
    }

    this._stencils.splice(0);
    while (this._objectLayer?.lastChild) {
      this._objectLayer.removeChild(this._objectLayer.lastChild);
    }
    this._connectors.splice(0);
    while (this._connectorLayer?.lastChild) {
      this._connectorLayer.removeChild(this._connectorLayer.lastChild);
    }

    state.stencils.forEach((stencilState) => {
      const sp = this._stencilSet.getStencilProperties(stencilState.typeName);
      if (sp !== undefined) {
        const stencil = this.addNewStencil(sp.stencilType);
        stencil.restoreState(stencilState);
        this._stencils.push(stencil);
      }
    });

    state.connectors.forEach((conState) => {
      const cp = this._stencilSet.getConnectorProperties(conState.typeName);
      if (cp !== undefined) {
        const startStencil = this._stencils.find(
          (s) => s.IId === conState.startStencilId
        );
        const endStencil = this._stencils.find(
          (s) => s.IId === conState.endStencilId
        );

        if (
          startStencil &&
          endStencil &&
          conState.startPortLocation &&
          conState.endPortLocation
        ) {
          const startPort = startStencil.ports.get(conState.startPortLocation);
          const endPort = endStencil.ports.get(conState.endPortLocation);

          if (startPort && endPort) {
            const connector = this.addNewConnector(cp.connectorType);
            connector.restoreState(conState, {
              startStencil: startStencil,
              startPort: startPort,
              endStencil: endStencil,
              endPort: endPort,
            });
            this._connectors.push(connector);
            startPort.connectors.push(connector);
            endPort.connectors.push(connector);
          }
        }
      }
    });
  }

  /**
   * NOTE:
   *
   * before removing or modifying this method please consider supporting marker.js
   * by visiting https://markerjs.com/buy for details
   *
   * thank you!
   */
  private _logoUI?: HTMLElement;
  private addLogo() {
    if (this._logoUI !== undefined) {
      this._container?.removeChild(this._logoUI);
    }
    this._logoUI = document.createElement('div');
    this._logoUI.style.display = 'inline-block';
    this._logoUI.style.margin = '0px';
    this._logoUI.style.padding = '0px';
    this._logoUI.style.fill = '#333333';

    const link = document.createElement('a');
    link.href = 'https://markerjs.com/';
    link.target = '_blank';
    link.innerHTML = Logo;
    link.title = 'Powered by marker.js';

    link.style.display = 'grid';
    link.style.alignItems = 'center';
    link.style.justifyItems = 'center';
    link.style.padding = '3px';
    link.style.width = '20px';
    link.style.height = '20px';

    this._logoUI.appendChild(link);

    this._container?.appendChild(this._logoUI);

    this._logoUI.style.position = 'absolute';
    this._logoUI.style.pointerEvents = 'all';
    this.positionLogo();
  }

  private removeLogo() {
    if (this._logoUI !== undefined) {
      this._container?.removeChild(this._logoUI);
    }
  }

  private positionLogo() {
    if (this._logoUI && this._container) {
      this._logoUI.style.left = `20px`;
      this._logoUI.style.top = `${
        this._container.offsetHeight - this._logoUI.clientHeight - 20
      }px`;
    }
  }
}
