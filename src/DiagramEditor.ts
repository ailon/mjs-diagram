import { Button, Panel, Toolbar, ToolbarBlock, ButtonEventData } from 'mjs-toolbar';
import { basicStencilEditorSet } from './BasicStencilEditorSet';
import { ConnectorBase } from './ConnectorBase';
import { ConnectorBaseEditor } from './ConnectorBaseEditor';
import { DiagramState } from './DiagramState';
import { IPoint } from './IPoint';
import { PortConnector } from './PortConnector';
import { StencilBase } from './StencilBase';
import { StencilBaseEditor } from './StencilBaseEditor';
import { SvgHelper } from './SvgHelper';
import { TextStencil } from './TextStencil';

export type DiagramEditorMode = 'select' | 'connect';

export interface DiagramEditorEventMap {
  'renderclick': CustomEvent<RenderEventData>;
}

export interface RenderEventData {
  state: DiagramState;
}

export class DiagramEditor extends HTMLElement {
  private _container?: HTMLDivElement;
  private _toolbarContainer?: HTMLDivElement;
  private _contentContainer?: HTMLDivElement;
  private _toolboxContainer?: HTMLDivElement;

  private overlayContainer!: HTMLDivElement;

  private mode: DiagramEditorMode = 'select';

  private _mainCanvas?: SVGSVGElement;
  private _groupLayer?: SVGGElement;
  private _connectorLayer?: SVGGElement;
  private _objectLayer?: SVGGElement;

  private _currentStencilEditor?: StencilBaseEditor;
  private _stencilEditors: StencilBaseEditor[] = [];

  private _currentConnectorEditor?: ConnectorBaseEditor;
  private _connectorEditors: ConnectorBaseEditor[] = [];

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

  private _stencilEditorSet = basicStencilEditorSet;
  
  constructor() {
    super();

    this.stencilCreated = this.stencilCreated.bind(this);
    this.connectorCreated = this.connectorCreated.bind(this);
    this.setCurrentStencil = this.setCurrentStencil.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onDblClick = this.onDblClick.bind(this);
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
    this.toolbarButtonClicked = this.toolbarButtonClicked.bind(this);

    this.switchToConnectMode = this.switchToConnectMode.bind(this);
    this.switchConnectModeOff = this.switchConnectModeOff.bind(this);

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
    this._container.style.userSelect = 'none';

    this._toolbarContainer = document.createElement('div');
    this._toolbarContainer.style.display = 'flex';
    this._toolbarContainer.style.backgroundColor = 'red';
    this._container.appendChild(this._toolbarContainer);

    this._contentContainer = document.createElement('div');
    this._contentContainer.style.display = 'flex';
    this._contentContainer.style.position = 'relative';
    this._contentContainer.style.flexGrow = '2';
    this._contentContainer.style.flexShrink = '1';
    this._contentContainer.style.backgroundColor = 'magenta';
    this._container.appendChild(this._contentContainer);

    this._toolboxContainer = document.createElement('div');
    this._toolboxContainer.style.display = 'flex';
    this._toolboxContainer.style.backgroundColor = 'cyan';
    this._container.appendChild(this._toolboxContainer);

    this._container.setAttribute('part', 'container');

    this.shadowRoot?.appendChild(this._container);
  }

  private addToolbar() {
    const panel = <Panel>document.createElement('mjstb-panel');

    const toolbar = new Toolbar();
    toolbar.addEventListener('buttonclick', this.toolbarButtonClicked);

    const block1 = new ToolbarBlock();
    const block2 = new ToolbarBlock();
    const block3 = new ToolbarBlock();

    const checkSVG = `<svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
    </svg>`;

    const button11 = new Button({ icon: checkSVG, command: 'run' });
    block1.appendButton(button11);
    const button12 = new Button({ text: 'Base', command: 'add-base' });
    block1.appendButton(button12);
    const button121 = new Button({ text: 'Text', command: 'add-text' });
    block1.appendButton(button121);
    const button13 = new Button({ text: "Connect", command: 'connect' });
    block1.appendButton(button13);

    const button21 = new Button({ text: 'click me', command: 'text' });
    block2.appendButton(button21);
    const button22 = new Button({ icon: checkSVG, command: 'save' });
    block2.appendButton(button22);

    toolbar.appendBlock(block1);
    toolbar.appendBlock(block2);
    toolbar.appendBlock(block3);

    panel.appendToolbar(toolbar);

    this._toolbarContainer?.appendChild(panel);
  }

  private toolbarButtonClicked(ev: CustomEvent<ButtonEventData>) {
    if (this.mode === 'connect' && ev.detail.button.command !== 'connect') {
      this.switchConnectModeOff();
    }

    switch (ev.detail.button.command) {
      case 'add-base': {
        this.createNewStencil(StencilBase);
        break;
      }
      case 'add-text': {
        this.createNewStencil(TextStencil);
        break;
      }
      case 'connect': {
        this.switchToConnectMode();
        break;
      }
      case 'save': {
        this.dispatchEvent(
          new CustomEvent<RenderEventData>('renderclick', {
            detail: { state: this.getState() },
          })
        );        
        break;
      }
    }
    console.log(`'${ev.detail.button.command}' button clicked.`);
  }

  private switchToConnectMode() {
    this.setCurrentStencil();
    this.mode = 'connect';
    this._stencilEditors.forEach(se => se.switchToConnectMode());
  }

  private switchConnectModeOff() {
    this.mode = 'select';
    this._stencilEditors.forEach(se => se.switchConnectModeOff());
  }

  private width = 0;
  private height = 0;

  private addMainCanvas() {
    this.width = this._contentContainer?.clientWidth || 0;
    this.height = this._contentContainer?.clientHeight || 0;

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

    this._contentContainer?.appendChild(this._mainCanvas);
  }

  private initOverlay(): void {
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.style.position = 'absolute';
    this.overlayContainer.style.pointerEvents = 'none';
    this.overlayContainer.style.left = '0px';
    this.overlayContainer.style.top = '0px';
    this.overlayContainer.style.width = `${this.width}px`;
    this.overlayContainer.style.height = `${this.height}px`;
    this.overlayContainer.style.display = 'flex';
    this._contentContainer?.appendChild(this.overlayContainer);
  }


  private connectedCallback() {
    this.createLayout();
    this.addToolbar();
    this.addMainCanvas();
    this.initOverlay();
    this.attachEvents();
  }

  private disconnectedCallback() {
    this.detachEvents();
  }

  private attachEvents() {
    this._mainCanvas?.addEventListener('pointerdown', this.onPointerDown);
    this._mainCanvas?.addEventListener('pointerup', this.onStencilPointerUp);
    this._mainCanvas?.addEventListener('dblclick', this.onDblClick);
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
    this._mainCanvas?.removeEventListener('dblclick', this.onDblClick);
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

  private connectionStartPort?: PortConnector;
  private connectionEndPort?: PortConnector;

  private onPointerDown(ev: PointerEvent) {
    // @todo
    // if (!this._isFocused) {
    //   this.focus();
    // }

    this.touchPoints++;
    if (this.touchPoints === 1 || ev.pointerType !== 'touch') {
      if (
        this._currentStencilEditor !== undefined &&
        (this._currentStencilEditor.state === 'new' ||
          this._currentStencilEditor.state === 'creating')
      ) {
        this.isDragging = true;
        this._currentStencilEditor.pointerDown(
          this.clientToLocalCoordinates(ev.clientX, ev.clientY)
        );
      }
      else if (this.mode === 'select' && ev.target) {
        const hitEditor = this._stencilEditors.find((m) => m.ownsTarget(ev.target));
        if (hitEditor !== undefined) {
          this.setCurrentStencil(hitEditor);
          this.isDragging = true;
          this._currentStencilEditor?.pointerDown(
            this.clientToLocalCoordinates(ev.clientX, ev.clientY),
            ev.target
          );
        } else {
          this.setCurrentStencil();
          this.isDragging = true;
          // @todo
          // this.prevPanPoint = { x: ev.clientX, y: ev.clientY };
        }
      } else if (this.mode === 'connect' && ev.target) {
        const hitEditor = this._stencilEditors.find((m) => m.ownsTarget(ev.target));
        if (hitEditor !== undefined) {
          this.connectionStartPort = hitEditor.getTargetPort(ev.target);
          if (this.connectionStartPort !== undefined) {
            this._currentConnectorEditor = this.addNewConnector(ConnectorBase);
            this._currentConnectorEditor.onConnectorCreated = this.connectorCreated;
            this._currentConnectorEditor.connector.startStencil = hitEditor.stencil;
            this._currentConnectorEditor.connector.startPort = this.connectionStartPort.port;
            this._currentConnectorEditor.pointerDown(
              { 
                x: hitEditor.stencil.left + this.connectionStartPort.port.x, 
                y: hitEditor.stencil.top + this.connectionStartPort.port.y
              },
              ev.target
            );
            console.log(this.connectionStartPort);
          }
        } else {
          this.isDragging = true;
          // @todo
          // this.prevPanPoint = { x: ev.clientX, y: ev.clientY };
        }
      }
    }
  }

  private onDblClick(ev: MouseEvent) {
    // @todo
    // if (!this._isFocused) {
    //   this.focus();
    // }

    if (this.mode === 'select') {
      const hitEditor = this._stencilEditors.find((se) => se.ownsTarget(ev.target));
      if (hitEditor !== undefined && hitEditor !== this._currentStencilEditor) {
        this.setCurrentStencil(hitEditor);
      }
      if (this._currentStencilEditor !== undefined && ev.target) {
        this._currentStencilEditor.dblClick(
          this.clientToLocalCoordinates(ev.clientX, ev.clientY),
          ev.target
        );
      } else {
        this.setCurrentStencil();
      }
    }
  }  

  private onPointerMove(ev: PointerEvent) {
    if (this.touchPoints === 1 || ev.pointerType !== 'touch') {
      if (this._currentStencilEditor !== undefined || this.isDragging) {
        // don't swallow the event when editing text
        if (
          this._currentStencilEditor === undefined ||
          this._currentStencilEditor.state !== 'edit'
        ) {
          ev.preventDefault();
        }

        if (this._currentStencilEditor !== undefined) {
          this._currentStencilEditor.manipulate(
            this.clientToLocalCoordinates(ev.clientX, ev.clientY)
          );
        }
        // @todo - handle zoomed state
        // else if (this.zoomLevel > 1) {
        //   this.panTo({ x: ev.clientX, y: ev.clientY });
        // }
      }
      if (this._currentConnectorEditor !== undefined) {
        this._currentConnectorEditor.manipulate(
          this.clientToLocalCoordinates(ev.clientX, ev.clientY)
        )
      }
    }
  }
  private onStencilPointerUp(ev: PointerEvent) {
    if (this.mode === 'connect' && ev.target) {
      const hitEditor = this._stencilEditors.find((m) => m.ownsTarget(ev.target));
      if (hitEditor !== undefined) {
        this.connectionEndPort = hitEditor.getTargetPort(ev.target);
        if (this._currentConnectorEditor !== undefined && this.connectionEndPort !== undefined) {
          this._currentConnectorEditor.connector.endStencil = hitEditor.stencil;
          this._currentConnectorEditor.connector.endPort = this.connectionEndPort.port;
          this._currentConnectorEditor.pointerUp(
            { 
              x: hitEditor.stencil.left + this.connectionEndPort.port.x, 
              y: hitEditor.stencil.top + this.connectionEndPort.port.y
            },
          );
        }
        console.log(this.connectionEndPort);
      }
    }
  }

  private onPointerUp(ev: PointerEvent) {
    if (this.touchPoints > 0) {
      this.touchPoints--;
    }
    if (this.touchPoints === 0) {
      if (this.isDragging && this._currentStencilEditor !== undefined) {
        this._currentStencilEditor.pointerUp(
          this.clientToLocalCoordinates(ev.clientX, ev.clientY)
        );
      }
    }
    this.isDragging = false;
    // @todo
    // this.addUndoStep();
  }

  private onPointerOut(/*ev: PointerEvent*/) {
    if (this.touchPoints > 0) {
      this.touchPoints--;
    }
  }

  public createNewStencil(steniclType: typeof StencilBase | string): void {

    const sType = this._stencilEditorSet.stencilSet.getStencilProperties(steniclType);

    if (sType) {
      this.setCurrentStencil();
      // @todo
      // this.addUndoStep();
      this._currentStencilEditor = this.addNewStencil(sType.stencilType);
      this._currentStencilEditor.onStencilCreated = this.stencilCreated;
      if (this._mainCanvas) {
        this._mainCanvas.style.cursor = 'crosshair';
      }
      // @todo
      // this.toolbar.setActiveMarkerButton(mType.typeName);
      // this.toolbox.setPanelButtons(this.currentMarker.toolboxPanels);
      // this.eventListeners['markercreating'].forEach((listener) =>
      //   listener(new MarkerEvent(this, this.currentMarker))
      // );
    }
  }

  private stencilCreated(stencilEditor: StencilBaseEditor) {
    this.mode = 'select';
    if (this._mainCanvas) {
      this._mainCanvas.style.cursor = 'default';
    }
    stencilEditor.onStencilChanged = this.stencilChanged;
    this._stencilEditors.push(stencilEditor);
    this.setCurrentStencil(stencilEditor);

    // @todo
    // this.toolbar.setSelectMode();
    // this.addUndoStep();
    // this.eventListeners['markercreate'].forEach((listener) =>
    //   listener(new MarkerEvent(this, this.currentMarker))
    // );
  }

  private stencilChanged(stencilEditor: StencilBaseEditor) {
    stencilEditor.stencil.ports.forEach(port => {
      if (port.enabled) {
        port.connectors.forEach(c => c.adjust());
      }
    })
  }

  private connectorCreated(connectorEditor: ConnectorBaseEditor) {
    connectorEditor.connector.startPort?.connectors.push(connectorEditor.connector);
    connectorEditor.connector.endPort?.connectors.push(connectorEditor.connector);
    this._connectorEditors.push(connectorEditor);
    this._objectLayer?.removeChild(connectorEditor.connector.container);
    this._connectorLayer?.appendChild(connectorEditor.connector.container);
  }

  public setCurrentStencil(stencilEditor?: StencilBaseEditor): void {
    if (this._currentStencilEditor !== stencilEditor) {
      // no need to deselect if not changed
      if (this._currentStencilEditor !== undefined) {
        this._currentStencilEditor.deselect();
        // @todo
        // this.toolbar.setCurrentMarker();
        // this.toolbox.setPanelButtons([]);
        // @todo
        // if (!this._isResizing) {
        //   this.eventListeners['markerdeselect'].forEach((listener) =>
        //     listener(new MarkerEvent(this, this.currentMarker))
        //   );
        // }
      }
    }
    this._currentStencilEditor = stencilEditor;
    if (this._currentStencilEditor !== undefined && !this._currentStencilEditor.isSelected) {
      if (this._currentStencilEditor.state !== 'new') {
      this._currentStencilEditor.select();
      }
      // @todo
      // this.toolbar.setCurrentMarker(this.currentMarker);
      // this.toolbox.setPanelButtons(this.currentMarker.toolboxPanels);

      // if (!this._isResizing) {
      //   this.eventListeners['markerselect'].forEach((listener) =>
      //     listener(new MarkerEvent(this, this.currentMarker))
      //   );
      // }
    }
  }

  private addNewStencil(stencilType: typeof StencilBase): StencilBaseEditor {
    const g = SvgHelper.createGroup();
    this._objectLayer?.appendChild(g);

    const editor = this._stencilEditorSet.getStencilEditor(stencilType);
    
    return new editor(
      this.getNewIId(),
      g,
      this.overlayContainer,
      stencilType,
    );
  }

  private addNewConnector(connectorType: typeof ConnectorBase, toLayer?: SVGGElement): ConnectorBaseEditor {
    const g = SvgHelper.createGroup();
    toLayer?.appendChild(g) ?? this._objectLayer?.appendChild(g);

    const connectorEditorType = this._stencilEditorSet.getConnectorEditor(connectorType);
    return new connectorEditorType(
      this.getNewIId(),
      g, 
      this.overlayContainer,
      connectorType
    );
  }

  addEventListener<T extends keyof DiagramEditorEventMap>(
    // the event name, a key of DiagramEditorEventMap
    type: T,

    // the listener, using a value of DiagramEditorEventMap
    listener: (this: Button, ev: DiagramEditorEventMap[T]) => void,

    // any options
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions | undefined): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void {
      super.addEventListener(type, listener, options);
  }


  public getState(): DiagramState {
    const result: DiagramState = {
      width: this.width,
      height: this.height,

      stencils: [],
      connectors: []
    };

    this._stencilEditors.forEach(se => result.stencils.push(se.stencil.getState()));
    this._connectorEditors.forEach(ce => result.connectors.push(ce.connector.getState()));

    return result;
  }  

  public restoreState(state: DiagramState): void {
    this._stencilEditors.splice(0);
    while (this._objectLayer?.lastChild) {
      this._objectLayer.removeChild(this._objectLayer.lastChild);
    }
    this._connectorEditors.splice(0);
    while (this._connectorLayer?.lastChild) {
      this._connectorLayer.removeChild(this._connectorLayer.lastChild);
    }
    this._iid = 0;

    state.stencils.forEach((stencilState) => {
      const stencilType = this._stencilEditorSet.stencilSet.getStencilProperties(stencilState.typeName);
      if (stencilType !== undefined) {
        const stencilEditor = this.addNewStencil(stencilType.stencilType);
        stencilEditor.restoreState(stencilState);
        this._iid = Math.max(this._iid, stencilEditor.stencil.IId); // adjust current iid counter
        stencilEditor.onStencilChanged = this.stencilChanged;
        this._stencilEditors.push(stencilEditor);
      }
    });    

    state.connectors.forEach((conState) => {
      const cp = this._stencilEditorSet.stencilSet.getConnectorProperties(conState.typeName);
      if (cp !== undefined) {
        const startStencil = this._stencilEditors.find(se => se.stencil.IId === conState.startStencilId);
        const endStencil = this._stencilEditors.find(se => se.stencil.IId === conState.endStencilId);

        if (startStencil && endStencil && conState.startPortLocation && conState.endPortLocation) {
          const startPort = startStencil.stencil.ports.get(conState.startPortLocation);
          const endPort = endStencil.stencil.ports.get(conState.endPortLocation);

          if (startPort && endPort) {
            const conEditor = this.addNewConnector(cp.connectorType, this._connectorLayer);
            conEditor.connector.restoreState(conState, {
              startStencil: startStencil.stencil,
              startPort: startPort,
              endStencil: endStencil.stencil,
              endPort: endPort
            });
            this._connectorEditors.push(conEditor);
            this._iid = Math.max(this._iid, conEditor.connector.IId); // adjust current iid counter
            startPort.connectors.push(conEditor.connector);
            endPort.connectors.push(conEditor.connector);
          }
        }
      }
    });
  }
}
