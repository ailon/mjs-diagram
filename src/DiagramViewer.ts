import {
  basicStencilSet,
  ConnectorBase,
  DiagramState,
  IPoint,
  StencilBase,
  SvgHelper,
  Activator,
  DiagramSettings,
} from './core';

import Logo from './assets/markerjs-logo-m.svg';

export interface DiagramViewerEventData {
  viewer: DiagramViewer;
}

export interface DiagramViewerEventMap {
  viewerinit: CustomEvent<DiagramViewerEventData>;
  diagramload: CustomEvent<DiagramViewerEventData>;
}

export interface StencilEventData {
  viewer: DiagramViewer;
  stencil: StencilBase;
}

export interface ConnectorEventData {
  viewer: DiagramViewer;
  connector: ConnectorBase;
}

export interface DiagramViewerEventMap {
  viewerinit: CustomEvent<DiagramViewerEventData>;
  diagramload: CustomEvent<DiagramViewerEventData>;
  stencilpointerenter: CustomEvent<StencilEventData>;
  stencilpointerleave: CustomEvent<StencilEventData>;
  stencilclick: CustomEvent<StencilEventData>;
  connectorpointerenter: CustomEvent<ConnectorEventData>;
  connectorpointerleave: CustomEvent<ConnectorEventData>;
  connectorclick: CustomEvent<ConnectorEventData>;
}

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

  public readonly settings: DiagramSettings = new DiagramSettings();

  constructor() {
    super();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onStencilPointerUp = this.onStencilPointerUp.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);

    this.clientToLocalCoordinates = this.clientToLocalCoordinates.bind(this);
    this.addStyles = this.addStyles.bind(this);

    this.addLogo = this.addLogo.bind(this);
    this.removeLogo = this.removeLogo.bind(this);
    this.positionLogo = this.positionLogo.bind(this);

    this.show = this.show.bind(this);
    this.setDocumentBgColor = this.setDocumentBgColor.bind(this);

    this.connectedCallback = this.connectedCallback.bind(this);

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
    g.classList.add('stencil-container');
    this._objectLayer?.appendChild(g);

    const stencil = new stencilType(this.getNewIId(), g, this.settings);

    stencil.container.addEventListener('pointerenter', () =>
      this.dispatchEvent(
        new CustomEvent<StencilEventData>('stencilpointerenter', {
          detail: { viewer: this, stencil: stencil },
        })
      )
    );
    stencil.container.addEventListener('pointerleave', () =>
      this.dispatchEvent(
        new CustomEvent<StencilEventData>('stencilpointerleave', {
          detail: { viewer: this, stencil: stencil },
        })
      )
    );
    stencil.container.addEventListener('click', () =>
      this.dispatchEvent(
        new CustomEvent<StencilEventData>('stencilclick', {
          detail: { viewer: this, stencil: stencil },
        })
      )
    );

    return stencil;
  }

  private addNewConnector(connectorType: typeof ConnectorBase): ConnectorBase {
    const g = SvgHelper.createGroup();
    g.classList.add('connector-container');
    this._connectorLayer?.appendChild(g);

    const connector = new connectorType(this.getNewIId(), g, this.settings);

    connector.container.addEventListener('pointerenter', () =>
      this.dispatchEvent(
        new CustomEvent<ConnectorEventData>('connectorpointerenter', {
          detail: { viewer: this, connector: connector },
        })
      )
    );
    connector.container.addEventListener('pointerleave', () =>
      this.dispatchEvent(
        new CustomEvent<ConnectorEventData>('connectorpointerleave', {
          detail: { viewer: this, connector: connector },
        })
      )
    );
    connector.container.addEventListener('click', () =>
      this.dispatchEvent(
        new CustomEvent<ConnectorEventData>('connectorclick', {
          detail: { viewer: this, connector: connector },
        })
      )
    );

    return connector;
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

  private addStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
      .stencil-container {
        cursor: default;
      }
      .connector-container {
        cursor: default;
      }
      .hidden {
        opacity: 0;
      }

      @keyframes fade_in_animation_frames {
        from {
          opacity: 0;
          transform: scale(0);
        }
        to {
          opacity: 1;
        }        
      }

      @keyframes connector_fade_in_animation_frames {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }        
      }

      @keyframes stencil_hover_frames {
        from {
          transform: scale(1);
          filter: drop-shadow(0px #888);
        }
        to {
          transform: scale(1.02);
          filter: drop-shadow(1px 2px 3px #888);
        }        
      }

      @keyframes connector_hover_frames {
        from {
          filter: drop-shadow(0px #888);
        }
        to {
          filter: drop-shadow(1px 2px 1px #888);
        }        
      }

      .fade-in {
        transform-origin: center;
        transform-box: fill-box;
        animation-duration: 0.3s;
        animation-fill-mode: forwards;
        animation-name: fade_in_animation_frames;     
        animation-timing-function: ease-out;   
      }
      .connector-fade-in {
        transform-origin: center;
        transform-box: fill-box;
        animation-duration: 0.3s;
        animation-fill-mode: forwards;
        animation-name: connector_fade_in_animation_frames;        
      }

      .stencil-container:hover {
        transform-origin: center;
        transform-box: fill-box;
        animation-duration: 0.1s;
        animation-fill-mode: forwards;
        animation-name: stencil_hover_frames;        
        animation-timing-function: ease-out;   
      }
      .connector-container:hover {
        transform-origin: center;
        transform-box: fill-box;
        animation-duration: 0.1s;
        animation-fill-mode: forwards;
        animation-name: connector_hover_frames;        
      }
    `;

    this.shadowRoot?.appendChild(styleSheet);
  }

  public show(state: DiagramState): void {
    this.dispatchEvent(
      new CustomEvent<DiagramViewerEventData>('viewerinit', {
        detail: { viewer: this },
      })
    );

    this.addStyles();

    if (state.width !== undefined && state.height !== undefined) {
      this.setDocumentSize(state.width, state.height);
    }
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

    if (state.stencils !== undefined && state.stencils.length > 0) {
      state.stencils.forEach((stencilState, index) => {
        const sp = this._stencilSet.getStencilProperties(stencilState.typeName);
        if (sp !== undefined) {
          const stencil = this.addNewStencil(sp.stencilType);
          stencil.container.classList.add('hidden');
          stencil.container.addEventListener('animationend', () => {
            stencil.container.classList.remove('hidden', 'fade-in');
          });
          stencil.restoreState(stencilState);
          this._stencils.push(stencil);
          setTimeout(() => {
            stencil.container.classList.add('fade-in');
          }, index * 250);
        }
      });
    }

    if (state.connectors !== undefined && state.connectors.length > 0) {
      state.connectors.forEach((conState, index) => {
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
            const startPort = startStencil.ports.get(
              conState.startPortLocation
            );
            const endPort = endStencil.ports.get(conState.endPortLocation);

            if (startPort && endPort) {
              const connector = this.addNewConnector(cp.connectorType);
              connector.container.classList.add('hidden');
              connector.container.addEventListener('animationend', () => {
                connector.container.classList.remove(
                  'hidden',
                  'connector-fade-in'
                );
              });
              connector.restoreState(conState, {
                startStencil: startStencil,
                startPort: startPort,
                endStencil: endStencil,
                endPort: endPort,
              });
              this._connectors.push(connector);
              startPort.connectors.push(connector);
              endPort.connectors.push(connector);
              setTimeout(() => {
                connector.container.classList.add('connector-fade-in');
              }, this._stencils.length * 250 + index * 50);
            }
          }
        }
      });
    }
    this.dispatchEvent(
      new CustomEvent<DiagramViewerEventData>('diagramload', {
        detail: { viewer: this },
      })
    );
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

  addEventListener<T extends keyof DiagramViewerEventMap>(
    // the event name, a key of DiagramViewerEventMap
    type: T,

    // the listener, using a value of DiagramViewerEventMap
    listener: (this: DiagramViewer, ev: DiagramViewerEventMap[T]) => void,

    // any options
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.addEventListener(type, listener, options);
  }
}
