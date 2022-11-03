import { Button, Panel, Toolbar, ToolbarBlock, ButtonEventData, ContentBlock } from 'mjs-toolbar';
import { basicStencilEditorSet } from './editor/BasicStencilEditorSet';
import { ConnectorBase } from './core/ConnectorBase';
import { ConnectorBaseEditor } from './editor/ConnectorBaseEditor';
import { DiagramState } from './core/DiagramState';
import { IPoint } from './core/IPoint';
import { PortConnector } from './editor/PortConnector';
import { PropertyPanelBase } from './editor/panels/PropertyPanelBase';
import { StencilBase } from './core/StencilBase';
import { StencilBaseEditor } from './editor/StencilBaseEditor';
import { SvgHelper } from './core/SvgHelper';
import { TextStencil } from './core/TextStencil';

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

  private _overlayContainer!: HTMLDivElement;
  private _internalUiContainer!: HTMLDivElement;

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

  private _toolboxPanel!: Panel;
  
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
    this.showAddDialog = this.showAddDialog.bind(this);
    this.addDialogStencilTypeClicked = this.addDialogStencilTypeClicked.bind(this);
    this.hideAddDialog = this.hideAddDialog.bind(this);

    this.addStyles = this.addStyles.bind(this);

    this.addToolboxPanels = this.addToolboxPanels.bind(this);

    this.attachShadow({ mode: 'open' });

    this.addStyles();
  }

  private _iid = 0;
  public getNewIId(): number {
    return ++this._iid;
  }

  private addStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
      div.add-item-dialog {
        pointer-events: auto;
        background-color: #333;
        color: #eee;
        font-size: 1rem;
        margin: 10px auto;
        width: 90%;
        max-width: 500px;
        display: flex;
        flex-direction: column;
      }

      div.add-item-dialog ul {
        flex-grow: 2;
      }

      div.add-item-dialog button {
        background-color: #333;
        color: #eee;
        display: block;
        margin: 10px auto;        
      }
      mjstb-panel::part(content-block) {
        background-color: gainsboro;
        border: 5px solid red;
      }
      mjstb-panel::part(content-block):hover {
          background-color: orangered;
      }    
      
      mjstb-toolbar {
        background-color: red;
      }
    `;

    this.shadowRoot?.appendChild(styleSheet);    
  }

  private createLayout() {
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.position = 'relative';

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
    this._toolboxContainer.style.position = 'absolute';
    this._toolboxContainer.style.right = '0px';
    this._toolboxContainer.style.top = '0px';
    this._toolboxContainer.style.minWidth = '200px';
    this._toolboxContainer.style.maxWidth = '500px';
    this._toolboxContainer.style.height = '100%';
    this._toolboxContainer.style.backgroundColor = 'cyan';
    this._contentContainer.appendChild(this._toolboxContainer);

    this._container.setAttribute('part', 'container');

    this.shadowRoot?.appendChild(this._container);
  }

  private addToolbar() {
    const panel = <Panel>document.createElement('mjstb-panel');
    panel.style.width = '100%';

    const toolbar = new Toolbar();
    toolbar.addEventListener('buttonclick', this.toolbarButtonClicked);

    const actionBlock = new ToolbarBlock();
    const createBlock = new ToolbarBlock();
    const zoomBlock = new ToolbarBlock();

    const selectButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M10.07,14.27C10.57,14.03 11.16,14.25 11.4,14.75L13.7,19.74L15.5,18.89L13.19,13.91C12.95,13.41 13.17,12.81 13.67,12.58L13.95,12.5L16.25,12.05L8,5.12V15.9L9.82,14.43L10.07,14.27M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z" />
</svg>`, text: 'select', command: 'run' });
    actionBlock.appendButton(selectButton);

    const deleteButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
</svg>`, text: 'delete', command: 'delete'});
    actionBlock.appendButton(deleteButton);

    const saveButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3M19 19H5V5H16.17L19 7.83V19M12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12M6 6H15V10H6V6Z" />
</svg>`, text: 'save', command: 'save'});
    actionBlock.appendButton(saveButton);

    const undoButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
</svg>`, text: 'undo', command: 'undo'});
    actionBlock.appendButton(undoButton);

    const redoButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.54,15.22L3.9,16C4.95,12.81 7.95,10.5 11.5,10.5C13.45,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z" />
</svg>`, text: 'redo', command: 'redo'});
    actionBlock.appendButton(redoButton);


    const addButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V6H11V8H5V17H17Z" />
</svg>`, text: 'add a stencil', command: 'add' });
    createBlock.appendButton(addButton);
    // const button12 = new Button({ text: 'Base', command: 'add-base' });
    // actionBlock.appendButton(button12);
    // const button121 = new Button({ text: 'Text', command: 'add-text' });
    // actionBlock.appendButton(button121);
    const connectButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M18,11H14.82C14.4,9.84 13.3,9 12,9C10.7,9 9.6,9.84 9.18,11H6C5.67,11 4,10.9 4,9V8C4,6.17 5.54,6 6,6H16.18C16.6,7.16 17.7,8 19,8A3,3 0 0,0 22,5A3,3 0 0,0 19,2C17.7,2 16.6,2.84 16.18,4H6C4.39,4 2,5.06 2,8V9C2,11.94 4.39,13 6,13H9.18C9.6,14.16 10.7,15 12,15C13.3,15 14.4,14.16 14.82,13H18C18.33,13 20,13.1 20,15V16C20,17.83 18.46,18 18,18H7.82C7.4,16.84 6.3,16 5,16A3,3 0 0,0 2,19A3,3 0 0,0 5,22C6.3,22 7.4,21.16 7.82,20H18C19.61,20 22,18.93 22,16V15C22,12.07 19.61,11 18,11M19,4A1,1 0 0,1 20,5A1,1 0 0,1 19,6A1,1 0 0,1 18,5A1,1 0 0,1 19,4M5,20A1,1 0 0,1 4,19A1,1 0 0,1 5,18A1,1 0 0,1 6,19A1,1 0 0,1 5,20Z" />
</svg>`, text: "connect", command: 'connect' });
    createBlock.appendButton(connectButton);

    const zoomInButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" />
</svg>`, text: 'zoom in', command: 'zoomin' });
    zoomBlock.appendButton(zoomInButton);

    const zoomResetButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 5.5L10 8H14L12 5.5M18 10V14L20.5 12L18 10M6 10L3.5 12L6 14V10M14 16H10L12 18.5L14 16M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3M21 19H3V5H21V19Z" />
</svg>`, text: 'fit', command: 'zoomreset' });
    zoomBlock.appendButton(zoomResetButton);

    const zoomOutButton = new Button({ icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" />
</svg>`, text: 'zoom out', command: 'zoomout' });
    zoomBlock.appendButton(zoomOutButton);

    toolbar.appendBlock(actionBlock);
    toolbar.appendBlock(createBlock);
    toolbar.appendBlock(zoomBlock);

    panel.appendToolbar(toolbar);

    this._toolbarContainer?.appendChild(panel);
  }

  private addToolbox() {
    this._toolboxPanel = <Panel>document.createElement('mjstb-panel');

    this._toolboxContainer?.appendChild(this._toolboxPanel);
  }

  private addToolboxPanels(panels: PropertyPanelBase[]) {
    this._toolboxPanel.clear();
    panels.forEach(p => {
      const cb = new ContentBlock();
      cb.title = p.title;
      cb.appendChild(p.getUi());
      this._toolboxPanel.appendChild(cb);
    })
  }

  private toolbarButtonClicked(ev: CustomEvent<ButtonEventData>) {
    if (this.mode === 'connect' && ev.detail.button.command !== 'connect') {
      this.switchConnectModeOff();
    }

    switch (ev.detail.button.command) {
      case 'add': {
        this.showAddDialog();
        break;
      }
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

  private _addItemDialog?: HTMLDivElement;

  private showAddDialog() {
    this._addItemDialog = document.createElement('div');
    this._addItemDialog.className = 'add-item-dialog';
    this._addItemDialog.style.pointerEvents = 'auto';

    const stencilTypeList = document.createElement('ul');
    this._addItemDialog.appendChild(stencilTypeList);

    this._stencilEditorSet.stencilSet.stencilTypes.forEach(st => {
      const listItem = document.createElement('li');
      listItem.innerText = st.displayName ?? st.stencilType.title;
      listItem.setAttribute('data-stencil-type', st.stencilType.typeName);
      listItem.addEventListener('click', this.addDialogStencilTypeClicked);
      stencilTypeList.appendChild(listItem);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'close';
    closeButton.addEventListener('click', this.hideAddDialog);
    this._addItemDialog.appendChild(closeButton);

    this._internalUiContainer.appendChild(this._addItemDialog);
  }
  
  private addDialogStencilTypeClicked(ev: MouseEvent) {
    const listItem = <HTMLLIElement>ev.target;

    const stencilType = listItem.getAttribute('data-stencil-type');
    if (stencilType) {
      this.createNewStencil(stencilType);
    }

    this.hideAddDialog();
  }

  private hideAddDialog() {
    if (this._addItemDialog) {
      this._internalUiContainer.removeChild(this._addItemDialog);
    }
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
    this._overlayContainer = document.createElement('div');
    this._overlayContainer.style.position = 'absolute';
    this._overlayContainer.style.pointerEvents = 'none';
    this._overlayContainer.style.left = '0px';
    this._overlayContainer.style.top = '0px';
    this._overlayContainer.style.width = `${this.width}px`;
    this._overlayContainer.style.height = `${this.height}px`;
    this._overlayContainer.style.display = 'flex';
    this._contentContainer?.appendChild(this._overlayContainer);
  }

  private initUiLayer(): void {
    this._internalUiContainer = document.createElement('div');
    this._internalUiContainer.style.position = 'absolute';
    this._internalUiContainer.style.pointerEvents = 'none';
    this._internalUiContainer.style.left = '0px';
    this._internalUiContainer.style.top = '0px';
    this._internalUiContainer.style.width = `${this.width}px`;
    this._internalUiContainer.style.height = `${this.height}px`;
    this._internalUiContainer.style.display = 'flex';
    this._contentContainer?.appendChild(this._internalUiContainer);
  }


  private connectedCallback() {
    this.createLayout();
    this.addToolbar();
    this.addToolbox();
    this.addMainCanvas();
    this.initOverlay();
    this.initUiLayer();
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
        this.addToolboxPanels([]);
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
      this.addToolboxPanels(this._currentStencilEditor.propertyPanels);

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
      this._overlayContainer,
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
      this._overlayContainer,
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
