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
import {
  Button,
  ButtonEventData,
  Panel,
  Toolbar,
  ToolbarBlock,
} from '@markerjs/mjs-toolbar';

/**
 * Defines event data for the {@link DiagramViewer} events.
 */
export interface DiagramViewerEventData {
  /**
   * {@link DiagramViewer} instance.
   */
  viewer: DiagramViewer;
}

/**
 * Defines event data for stencil-related events in {@link DiagramViewer}.
 */
export interface StencilEventData {
  /**
   * {@link DiagramViewer} instance.
   */
  viewer: DiagramViewer;
  /**
   * Stencil target of the event.
   */
  stencil: StencilBase;
}

/**
 * Defines event data for connector-related events in {@link DiagramViewer}.
 */
export interface ConnectorEventData {
  /**
   * {@link DiagramViewer} instance.
   */
  viewer: DiagramViewer;
  /**
   * Connector target of the event.
   */
  connector: ConnectorBase;
}

/**
 * {@link DiagramViewer} events.
 */
export interface DiagramViewerEventMap {
  /**
   * Viewer initialized.
   */
  viewerinit: CustomEvent<DiagramViewerEventData>;
  /**
   * Diagram loaded.
   */
  diagramload: CustomEvent<DiagramViewerEventData>;
  /**
   * Pointer entered stencil.
   */
  stencilpointerenter: CustomEvent<StencilEventData>;
  /**
   * Pointer left stencil.
   */
  stencilpointerleave: CustomEvent<StencilEventData>;
  /**
   * Stencil clicked.
   */
  stencilclick: CustomEvent<StencilEventData>;
  /**
   * Pointer entered connector.
   */
  connectorpointerenter: CustomEvent<ConnectorEventData>;
  /**
   * Pointer left connector.
   */
  connectorpointerleave: CustomEvent<ConnectorEventData>;
  /**
   * Connector clicked.
   */
  connectorclick: CustomEvent<ConnectorEventData>;
}

/**
 * Describes desired auto-scaling behavior.
 * @since 1.1.0
 */
export type AutoScaleDirection = 'none' | 'down' | 'up' | 'both';

/**
 * DiagramViewer is the main diagram viewing web component of the MJS Diagram library.
 *
 * You add an instance of DiagramViewer to your page to display dynamic and interactive diagrams
 * created either with {@link editor!DiagramEditor} or in code.
 *
 * You can add it in your HTML markup as a custom element with something like this:
 *
 * ```html
 * <mjs-diagram-viewer id="mjsDiaViewer"></mjs-diagram-viewer>
 * ```
 *
 * Or you can add it in code.
 *
 * One important thing to set when the component loads is the {@link core!StencilSet} you want to use.
 *
 * Here we add a Flowchart stencil set:
 *
 * ```ts
 * let viewer = document.getElementById('mjsDiaViewer');
 * viewer.stencilSet = flowchartStencilSet;
 * ```
 *
 * You display previously saved or created state by passing it to the {@link DiagramViewer.show} method.
 *
 * ```ts
 * viewer.show(myState);
 * ```
 *
 * @see
 * Check out MJS Diagram [docs](https://markerjs.com/docs/diagram/getting-started)
 * and [demos](https://markerjs.com/demos/diagram/getting-started/) for more details.
 */
export class DiagramViewer extends HTMLElement {
  private _container?: HTMLDivElement;
  private _contentContainer?: HTMLDivElement;
  private _canvasContainer?: HTMLDivElement;
  private _toolbarAreaContainer?: HTMLDivElement;
  private _toolbarContainer?: HTMLDivElement;

  private _mainCanvas?: SVGSVGElement;
  private _groupLayer?: SVGGElement;
  private _connectorLayer?: SVGGElement;
  private _objectLayer?: SVGGElement;

  private _stencils: StencilBase[] = [];

  private _connectors: ConnectorBase[] = [];

  private _resizeObserver?: ResizeObserver;

  /**
   * Zoom level steps the interactive zoom controls go through.
   */
  public zoomSteps = [0.5, 0.75, 1, 1.5, 2, 4];
  private _zoomLevel = 1;
  /**
   * Gets the current zoom level of the control (1 is 100%).
   */
  public get zoomLevel(): number {
    return this._zoomLevel;
  }
  /**
   * Set the zoom level of the contrl (1 is 100%).
   */
  public set zoomLevel(value: number) {
    this._zoomLevel = value;
    if (this._canvasContainer && this._contentContainer && this._mainCanvas) {
      this._mainCanvas.style.width = `${this.documentWidth * this.zoomLevel}px`;
      this._mainCanvas.style.height = `${
        this.documentHeight * this.zoomLevel
      }px`;
      //this._mainCanvas.style.transform = `scale(${this._zoomLevel})`;
      this._canvasContainer.scrollTo({
        left:
          (this._mainCanvas.clientWidth - this._canvasContainer.clientWidth) /
          2,
        top:
          (this._mainCanvas.clientHeight - this._canvasContainer.clientHeight) /
          2,
      });
    }
  }

  private _autoScaling: AutoScaleDirection = 'down';
  /**
   * Configures auto-scaling behavior.
   *
   * - `none` - no auto-scaling
   * - `down` (default) - auto-scales the diagram down when it doesn't fit into the control
   * - `up` - auto-scales the diagram to the largest size fitting into the control but not smaller than 100%
   * - `both` - keeps diagram at maximum size that fits into the control
   * 
   * @since 1.1.0
   */
  public get autoScaling(): AutoScaleDirection {
    return this._autoScaling;
  }
  public set autoScaling(value) {
    this._autoScaling = value;
    this.autoScale();
  }

  private _stencilSet = basicStencilSet;
  /**
   * Returns currently active {@link core!StencilSet}.
   */
  public get stencilSet() {
    return this._stencilSet;
  }
  /**
   * Sets current {@link core!StencilSet}.
   */
  public set stencilSet(value) {
    this._stencilSet = value;
    this.toggleLogo();
  }

  /**
   * Diagram settings.
   */
  public readonly settings: DiagramSettings = new DiagramSettings();

  /**
   * Creates a new instance of the Diagram Viewer.
   */
  constructor() {
    super();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onStencilPointerUp = this.onStencilPointerUp.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);

    this.clientToLocalCoordinates = this.clientToLocalCoordinates.bind(this);
    this.addStyles = this.addStyles.bind(this);

    this.toggleLogo = this.toggleLogo.bind(this);
    this.addLogo = this.addLogo.bind(this);
    this.removeLogo = this.removeLogo.bind(this);
    this.positionLogo = this.positionLogo.bind(this);

    this.show = this.show.bind(this);
    this.setDocumentBgColor = this.setDocumentBgColor.bind(this);

    this.connectedCallback = this.connectedCallback.bind(this);

    //this.addToolbar = this.addToolbar.bind(this);
    this.zoom = this.zoom.bind(this);
    this.toolbarButtonClicked = this.toolbarButtonClicked.bind(this);

    this.setupResizeObserver = this.setupResizeObserver.bind(this);
    this.autoScale = this.autoScale.bind(this);

    this.attachShadow({ mode: 'open' });
  }

  private _iid = 0;
  /**
   * Returns a new internal object identifier.
   * @returns
   */
  public getNewIId(): number {
    return ++this._iid;
  }

  private createLayout() {
    this.style.display = 'block';
    this.style.width = this.style.width !== '' ? this.style.width : '100%';
    this.style.height = this.style.height !== '' ? this.style.height : '100%';
    this.style.position = 'relative';

    this._container = document.createElement('div');
    this._container.className = 'main-container';
    this._container.style.display = 'flex';
    this._container.style.width = '100%';
    this._container.style.height = '100%';
    this._container.style.userSelect = 'none';
    // this._container.style.backgroundColor = 'green';

    this._contentContainer = document.createElement('div');
    this._contentContainer.style.display = 'grid';
    this._contentContainer.style.position = 'relative';
    this._contentContainer.style.flexGrow = '2';
    this._contentContainer.style.flexShrink = '1';
    this._contentContainer.style.overflow = 'hidden';
    this._contentContainer.style.gridTemplateRows = 'auto 60px';
    this._contentContainer.style.gridTemplateColumns = '1fr';
    // this._contentContainer.style.backgroundColor = 'red';

    this._container.appendChild(this._contentContainer);

    this._canvasContainer = document.createElement('div');
    this._canvasContainer.style.touchAction = 'pinch-zoom';
    this._canvasContainer.className = 'canvas-container';
    this._canvasContainer.style.display = 'grid';
    this._canvasContainer.style.gridTemplateColumns = '1fr';
    this._canvasContainer.style.flexGrow = '2';
    this._canvasContainer.style.flexShrink = '2';
    this._canvasContainer.style.justifyItems = 'center';
    this._canvasContainer.style.alignItems = 'center';
    this._canvasContainer.style.overflow = 'auto';
    this._canvasContainer.style.gridRow = '1/3';
    this._canvasContainer.style.gridColumn = '1';
    this._contentContainer.appendChild(this._canvasContainer);

    this._toolbarAreaContainer = document.createElement('div');
    this._toolbarAreaContainer.className = 'toolbar-area';
    this._toolbarAreaContainer.style.display = 'flex';
    this._toolbarAreaContainer.style.gridRow = '2';
    this._toolbarAreaContainer.style.gridColumn = '1';
    this._toolbarAreaContainer.style.justifyContent = 'center';
    this._toolbarAreaContainer.style.marginBottom = '10px';
    this._contentContainer.appendChild(this._toolbarAreaContainer);

    this._toolbarContainer = document.createElement('div');
    this._toolbarAreaContainer.appendChild(this._toolbarContainer);

    this._container.setAttribute('part', 'container');

    this.shadowRoot?.appendChild(this._container);
  }

  private addToolbar() {
    const panel = <Panel>document.createElement('mjstb-panel');
    panel.className = 'toolbar-panel';
    // panel.style.width = '100%';

    const toolbar = new Toolbar();
    toolbar.addEventListener('buttonclick', this.toolbarButtonClicked);

    const zoomBlock = new ToolbarBlock();
    const zoomOutButton = new Button({
      icon: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M19,13H5V11H19V13Z" />
</svg>`,
      text: 'zoom out',
      command: 'zoomout',
    });
    zoomBlock.appendButton(zoomOutButton);

    const zoomResetButton = new Button({
      icon: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 5.5L10 8H14L12 5.5M18 10V14L20.5 12L18 10M6 10L3.5 12L6 14V10M14 16H10L12 18.5L14 16M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3M21 19H3V5H21V19Z" />
</svg>`,
      text: 'fit',
      command: 'zoomreset',
    });
    zoomBlock.appendButton(zoomResetButton);

    const zoomInButton = new Button({
      icon: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
</svg>`,
      text: 'zoom in',
      command: 'zoomin',
    });
    zoomBlock.appendButton(zoomInButton);

    toolbar.appendBlock(zoomBlock);

    panel.appendToolbar(toolbar);

    this._toolbarContainer?.appendChild(panel);
  }

  private toolbarButtonClicked(ev: CustomEvent<ButtonEventData>) {
    switch (ev.detail.button.command) {
      case 'zoomin': {
        this.zoom(1);
        break;
      }
      case 'zoomout': {
        this.zoom(-1);
        break;
      }
      case 'zoomreset': {
        if (this.zoomLevel === 1) {
          this.autoScale();
        } else {
          this.zoom(0);
        }
        break;
      }
    }
  }

  /**
   * Zooms in or out to the supplied zoom level (1 = 100%).
   * @param factor zoom level.
   */
  public zoom(factor: number): void {
    const currentLevelIndex = this.zoomSteps.indexOf(this.zoomLevel);
    if (factor === 0 || currentLevelIndex === -1) {
      this.zoomLevel = 1;
    } else if (factor > 0 && currentLevelIndex < this.zoomSteps.length - 1) {
      this.zoomLevel = this.zoomSteps[currentLevelIndex + 1];
    } else if (factor < 0 && currentLevelIndex > 0) {
      this.zoomLevel = this.zoomSteps[currentLevelIndex - 1];
    }
  }

  /**
   * Scales the diagram inside the viewer according to the {@link autoScaling} setting.
   * @since 1.1.0
   */
  public autoScale(): void {
    if (this.autoScaling !== 'none' && this._container) {
      if (
        this.autoScaling === 'both' ||
        (this._container.clientWidth > this.documentWidth &&
          this._container.clientHeight > this.documentHeight &&
          this.autoScaling === 'up') ||
        ((this._container.clientWidth < this.documentWidth ||
          this._container.clientHeight < this.documentHeight) &&
          this.autoScaling === 'down')
      ) {
        // 2% margin to avoid flickering scrollbars
        this.zoomLevel = Math.min(
          (this._container.clientWidth * 0.98) / this.documentWidth,
          (this._container.clientHeight * 0.98) / this.documentHeight
        );
      }
    }
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
    this._mainCanvas.style.filter = 'var(--i-mjsdiav-canvas-filter)';

    this._groupLayer = SvgHelper.createGroup();
    this._connectorLayer = SvgHelper.createGroup();
    this._objectLayer = SvgHelper.createGroup();

    this._mainCanvas.appendChild(this._groupLayer);
    this._mainCanvas.appendChild(this._connectorLayer);
    this._mainCanvas.appendChild(this._objectLayer);

    this._canvasContainer?.appendChild(this._mainCanvas);
  }

  private connectedCallback() {
    Activator.addKeyAddListener(this.toggleLogo);
    this.createLayout();
    this.addMainCanvas();
    this.addToolbar();
    this.attachEvents();
  }

  private disconnectedCallback() {
    this.detachEvents();
  }

  private attachEvents() {
    this.setupResizeObserver();
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
    if (this._resizeObserver && this._container) {
      this._resizeObserver.unobserve(this._container);
    }
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

  private setupResizeObserver() {
    if (window.ResizeObserver && this._container) {
      this._resizeObserver = new ResizeObserver(() => {
        this.autoScale();
      });
      this._resizeObserver.observe(this._container);
    }
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
      * {
        --i-mjsdiav-canvas-background-color: var(--mjsdiav-canvas-background-color, #fff);
        --i-mjsdiav-canvas-filter: var(--mjsdiav-canvas-filter);
        
        --i-mjsdiav-tb-background-color: var(--mjsdiav-tb-background-color, #fff);
        --i-mjsdiav-tb-border-color: var(--mjsdiav-tb-border-color, #fafafa);
        --i-mjsdiav-tb-fore-color: var(--mjsdiav-tb-fore-color, #333);
        --i-mjsdiav-tb-button-border-color: var(--mjsdiav-tb-button-border-color, #fff);
        --i-mjsdiav-tb-background-color-hover: var(--mjsdiav-tb-background-color-hover, #fcfcfc);
        --i-mjsdiav-tb-button-border-color-hover: var(--mjsdiav-tb-button-border-color-hover, #fafafa);
      }
      .canvas-container {
        background-color: var(--i-mjsdiav-canvas-background-color);
        scrollbar-width: thin;
      }
      .canvas-container::-webkit-scrollbar {
        height: 10px;
        width: 10px;
      }
      .canvas-container::-webkit-scrollbar-track {
        background-color: transparent;
      }
      .canvas-container::-webkit-scrollbar-thumb {
        background-color: #444;
        border-radius: 20px;
        border: 2px solid #aaa;
      }      
      .stencil-container {
        cursor: default;
      }
      .connector-container {
        cursor: default;
      }
      .hidden {
        opacity: 0;
      }

      .toolbar-area {
        opacity: 0;
      }
      .main-container:hover .toolbar-area {
        opacity: 1;
      }
      .toolbar-area:hover {
        opacity: 1;
      }

      mjstb-panel.toolbar-panel::part(panel) {
        background-color: var(--i-mjsdiav-tb-background-color);
        border: 2px solid var(--i-mjsdiav-tb-border-color);
        border-radius: 5px;
        opacity: 0.5;
      }
      mjstb-panel.toolbar-panel::part(panel):hover {
        opacity: 1;
      }
      mjstb-panel.toolbar-panel::part(toolbar) {
        padding: 5px;
        justify-content: space-between;
      }
      mjstb-panel.toolbar-panel::part(toolbar-block) {
      }
      mjstb-panel.toolbar-panel::part(button) {
        color: var(--i-mjsdiav-tb-fore-color);
        background-color: var(--i-mjsdiav-tb-background-color);
        width: 36px;
        height: 36px;
        border-radius: 3px;
        border: 2px solid var(--i-mjsdiav-tb-button-border-color);
      }
      mjstb-panel.toolbar-panel::part(button):hover {
        background-color: var(--i-mjsdiav-tb-background-color-hover);
        border-color: var(--i-mjsdiav-tb-button-border-color-hover);
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

  /**
   * Displays a previously saved diagram.
   *
   * @remarks
   * Make sure to set the correct corresponding {@link DiagramViewer.stencilSet} before
   * calling `show()`.
   *
   * @param state diagram configration object.
   */
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
  private toggleLogo() {
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
    if (
      this._container &&
      this._logoUI !== undefined &&
      this._container.contains(this._logoUI)
    ) {
      this._container.removeChild(this._logoUI);
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
