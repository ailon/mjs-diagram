import {
  Button,
  Panel,
  Toolbar,
  ToolbarBlock,
  ButtonEventData,
  ContentBlock,
} from 'mjs-toolbar';
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
import { Port } from './core/Port';
import { Renderer } from './editor/Renderer';

export type DiagramEditorMode = 'select' | 'connect';

export interface DiagramEditorEventMap {
  renderclick: CustomEvent<RenderEventData>;
}

export interface RenderEventData {
  state: DiagramState;
}

export class DiagramEditor extends HTMLElement {
  private _container?: HTMLDivElement;
  private _toolbarContainer?: HTMLDivElement;
  private _contentContainer?: HTMLDivElement;
  private _canvasContainer?: HTMLDivElement;
  private _toolboxContainer?: HTMLDivElement;

  private _overlayContainer!: HTMLDivElement;
  private _overlayContentContainer!: HTMLDivElement;
  private _internalUiContainer!: HTMLDivElement;

  private mode: DiagramEditorMode = 'select';

  private _mainCanvas?: SVGSVGElement;
  private _groupLayer?: SVGGElement;
  private _connectorLayer?: SVGGElement;
  private _objectLayer?: SVGGElement;

  private _currentStencilEditor?: StencilBaseEditor;
  private _selectedStencilEditors: StencilBaseEditor[] = [];
  private _stencilEditors: StencilBaseEditor[] = [];

  private _currentConnectorEditor?: ConnectorBaseEditor;
  private _connectorEditors: ConnectorBaseEditor[] = [];

  public zoomSteps = [0.5, 0.8, 1, 1.5, 2, 4];
  private _zoomLevel = 1;
  public get zoomLevel(): number {
    return this._zoomLevel;
  }
  public set zoomLevel(value: number) {
    this._zoomLevel = value;
    if (this._canvasContainer && this._contentContainer && this._mainCanvas) {
      this._mainCanvas.style.transform = `scale(${this._zoomLevel})`;
      // @todo scroll to selected object or center
      // this._canvasContainer.scrollTo({
      //   left:
      //     (this._mainCanvas.clientWidth * this._zoomLevel -
      //       this._canvasContainer.clientWidth) /
      //     2,
      //   top:
      //     (this._mainCanvas.clientHeight * this._zoomLevel -
      //       this._canvasContainer.clientHeight) /
      //     2,
      // });
    }
  }

  private _stencilEditorSet = basicStencilEditorSet;

  private _toolboxPanel!: Panel;

  protected _manipulationStartX = 0;
  protected _manipulationStartY = 0;

  constructor() {
    super();

    this.stencilCreated = this.stencilCreated.bind(this);
    this.connectorCreated = this.connectorCreated.bind(this);
    this.connectorUpdated = this.connectorUpdated.bind(this);
    this.setCurrentStencil = this.setCurrentStencil.bind(this);
    this.selectStencil = this.selectStencil.bind(this);
    this.deselectStencil = this.deselectStencil.bind(this);

    this.onDblClick = this.onDblClick.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onCanvasPointerDown = this.onCanvasPointerDown.bind(this);
    this.onCanvasPointerMove = this.onCanvasPointerMove.bind(this);
    this.onCanvasPointerUp = this.onCanvasPointerUp.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);
    this.clientToLocalCoordinates = this.clientToLocalCoordinates.bind(this);
    this.toolbarButtonClicked = this.toolbarButtonClicked.bind(this);

    this.toggleConnectMode = this.toggleConnectMode.bind(this);
    this.switchToConnectMode = this.switchToConnectMode.bind(this);
    this.switchConnectModeOff = this.switchConnectModeOff.bind(this);
    this.showAddDialog = this.showAddDialog.bind(this);
    this.addDialogStencilTypeClicked =
      this.addDialogStencilTypeClicked.bind(this);
    this.hideAddDialog = this.hideAddDialog.bind(this);

    this.selectHitEditor = this.selectHitEditor.bind(this);
    this.selectHitConnector = this.selectHitConnector.bind(this);

    this.addStyles = this.addStyles.bind(this);

    this.addToolboxPanels = this.addToolboxPanels.bind(this);
    this.toggleToolbox = this.toggleToolbox.bind(this);

    this.deleteSelected = this.deleteSelected.bind(this);
    this.deleteConnector = this.deleteConnector.bind(this);
    this.deleteStencilEditor = this.deleteStencilEditor.bind(this);
    this.findConnectorEditor = this.findConnectorEditor.bind(this);

    this.zoom = this.zoom.bind(this);

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
        max-width: 520px;
        height: 90%;
        max-height: 500px;
        display: flex;
        flex-direction: column;
        filter: drop-shadow(2px 2px 8px #444);
      }

      div.add-item-dialog ul {
        display: flex;
        flex-grow: 2;
        flex-wrap: wrap;
        overflow-y: auto;
        align-content: flex-start;
        justify-content: center;
        padding: 10px;
        margin: 0px auto;
      }

      div.add-item-dialog ul li.list-item {
        display: block;
        padding: 8px 4px;
        border: 1px solid transparent;
        cursor: pointer;
      }
      div.add-item-dialog ul li.list-item:hover {
        border-color: #555;        
      }
      
      div.add-item-dialog ul li.list-item p.stencil-title {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 0.9rem;
        text-align: center;
        margin: 0px;
      }

      div.add-item-dialog ul li.list-item svg {
        fill: #aaa;
        stroke-width: 2px;
        stroke: #0a0a0a;
      }

      div.add-item-dialog ul li.list-item svg text {
        fill: black;
        stroke-width: 0px;
      }

      div.add-item-dialog button {
        background-color: #333;
        color: #eee;
        display: block;
        margin: 10px auto;        
      }

      mjstb-panel {
        --i-mjstb-accent-color: var(--mjstb-accent-color, #cceeff);
        --i-mjstb-background-color: var(--mjstb-background-color, #333);
      }

      mjstb-panel.toolbar-panel::part(panel) {
        background-color: var(--i-mjstb-background-color);
        border-bottom: 2px solid #383838;
      }
      mjstb-panel.toolbar-panel::part(toolbar) {
        padding: 5px;
        justify-content: space-between;
      }
      mjstb-panel.toolbar-panel::part(toolbar-block) {
      }
      mjstb-panel.toolbar-panel::part(button) {
        width: 36px;
        height: 36px;
        border-radius: 3px;
        border: 2px solid #333;
      }
      mjstb-panel.toolbar-panel::part(button):hover {
        background-color: #383838;
        border-color: #222;
      }

      mjstb-panel.toolbox-panel {
        width: 100%;
      }
      mjstb-panel.toolbox-panel::part(panel) {
        background-color: #333;
        border-left: 2px solid #383838;
      }
      mjstb-panel.toolbox-panel::part(content-block) {
        background-color: #333;
        padding: 5px;
        border: 2px solid #444;
        border-radius: 3px;
        overflow: hidden;
      }
      mjstb-panel.toolbox-panel::part(content-block-title) {
        margin: -5px;
        margin-bottom: 5px;
        padding: 5px;
        border-bottom: 1px solid #444;
        color: #ccc;
        font-family: Helvetica, Arial, Sans-Serif;
        font-size: 0.8rem;
      }
      mjstb-panel::part(content-block):hover {
        border-color: #555;
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
    this._contentContainer.style.overflow = 'hidden';
    this._container.appendChild(this._contentContainer);

    this._canvasContainer = document.createElement('div');
    this._canvasContainer.style.display = 'grid';
    this._canvasContainer.style.gridTemplateColumns = '1fr';
    this._canvasContainer.style.flexGrow = '2';
    this._canvasContainer.style.flexShrink = '2';
    this._canvasContainer.style.backgroundColor = '#aaa';
    this._canvasContainer.style.justifyItems = 'center';
    this._canvasContainer.style.alignItems = 'center';
    this._canvasContainer.style.overflow = 'auto';
    this._contentContainer.appendChild(this._canvasContainer);

    this._toolboxContainer = document.createElement('div');
    this._toolboxContainer.style.display = 'flex';
    this._toolboxContainer.style.minWidth = '200px';
    this._toolboxContainer.style.width = '250px';
    this._toolboxContainer.style.maxWidth = '250px';
    this._toolboxContainer.style.height = '100%';
    this._toolboxContainer.style.backgroundColor = 'cyan';
    this._toolboxContainer.style.zIndex = '10';
    this._toolboxContainer.style.filter = 'drop-shadow(-2px 0px 4px #333)';

    this._contentContainer.appendChild(this._toolboxContainer);

    this._container.setAttribute('part', 'container');

    this.shadowRoot?.appendChild(this._container);
  }

  private addToolbar() {
    const panel = <Panel>document.createElement('mjstb-panel');
    panel.className = 'toolbar-panel';
    panel.style.width = '100%';

    const toolbar = new Toolbar();
    toolbar.addEventListener('buttonclick', this.toolbarButtonClicked);

    const actionBlock = new ToolbarBlock();
    const createBlock = new ToolbarBlock();
    const zoomBlock = new ToolbarBlock();
    const settingsBlock = new ToolbarBlock();

    const selectButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M10.07,14.27C10.57,14.03 11.16,14.25 11.4,14.75L13.7,19.74L15.5,18.89L13.19,13.91C12.95,13.41 13.17,12.81 13.67,12.58L13.95,12.5L16.25,12.05L8,5.12V15.9L9.82,14.43L10.07,14.27M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z" />
</svg>`,
      text: 'select',
      command: 'run',
    });
    actionBlock.appendButton(selectButton);

    const deleteButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
</svg>`,
      text: 'delete',
      command: 'delete',
    });
    actionBlock.appendButton(deleteButton);

    const saveButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3M19 19H5V5H16.17L19 7.83V19M12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12M6 6H15V10H6V6Z" />
</svg>`,
      text: 'save',
      command: 'save',
    });
    actionBlock.appendButton(saveButton);

    const undoButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
</svg>`,
      text: 'undo',
      command: 'undo',
    });
    actionBlock.appendButton(undoButton);

    const redoButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.54,15.22L3.9,16C4.95,12.81 7.95,10.5 11.5,10.5C13.45,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z" />
</svg>`,
      text: 'redo',
      command: 'redo',
    });
    actionBlock.appendButton(redoButton);

    const addButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V6H11V8H5V17H17Z" />
</svg>`,
      text: 'add a stencil',
      command: 'add',
    });
    createBlock.appendButton(addButton);

    const connectButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M18,11H14.82C14.4,9.84 13.3,9 12,9C10.7,9 9.6,9.84 9.18,11H6C5.67,11 4,10.9 4,9V8C4,6.17 5.54,6 6,6H16.18C16.6,7.16 17.7,8 19,8A3,3 0 0,0 22,5A3,3 0 0,0 19,2C17.7,2 16.6,2.84 16.18,4H6C4.39,4 2,5.06 2,8V9C2,11.94 4.39,13 6,13H9.18C9.6,14.16 10.7,15 12,15C13.3,15 14.4,14.16 14.82,13H18C18.33,13 20,13.1 20,15V16C20,17.83 18.46,18 18,18H7.82C7.4,16.84 6.3,16 5,16A3,3 0 0,0 2,19A3,3 0 0,0 5,22C6.3,22 7.4,21.16 7.82,20H18C19.61,20 22,18.93 22,16V15C22,12.07 19.61,11 18,11M19,4A1,1 0 0,1 20,5A1,1 0 0,1 19,6A1,1 0 0,1 18,5A1,1 0 0,1 19,4M5,20A1,1 0 0,1 4,19A1,1 0 0,1 5,18A1,1 0 0,1 6,19A1,1 0 0,1 5,20Z" />
</svg>`,
      text: 'connect',
      command: 'connect',
    });
    createBlock.appendButton(connectButton);

    const zoomInButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" />
</svg>`,
      text: 'zoom in',
      command: 'zoomin',
    });
    zoomBlock.appendButton(zoomInButton);

    const zoomResetButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 5.5L10 8H14L12 5.5M18 10V14L20.5 12L18 10M6 10L3.5 12L6 14V10M14 16H10L12 18.5L14 16M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3M21 19H3V5H21V19Z" />
</svg>`,
      text: 'fit',
      command: 'zoomreset',
    });
    zoomBlock.appendButton(zoomResetButton);

    const zoomOutButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" />
</svg>`,
      text: 'zoom out',
      command: 'zoomout',
    });
    zoomBlock.appendButton(zoomOutButton);

    const toolboxToggleButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z" />
</svg>`,
      text: 'toggle properties',
      command: 'properties',
    });
    settingsBlock.appendButton(toolboxToggleButton);

    toolbar.appendBlock(actionBlock);
    toolbar.appendBlock(createBlock);
    toolbar.appendBlock(zoomBlock);
    toolbar.appendBlock(settingsBlock);

    panel.appendToolbar(toolbar);

    this._toolbarContainer?.appendChild(panel);
  }

  private addToolbox() {
    this._toolboxPanel = <Panel>document.createElement('mjstb-panel');
    this._toolboxPanel.className = 'toolbox-panel';

    this._toolboxContainer?.appendChild(this._toolboxPanel);
  }

  private addToolboxPanels(panels: PropertyPanelBase[]) {
    this._toolboxPanel.clear();
    panels.forEach((p) => {
      const cb = new ContentBlock();
      cb.title = p.title;
      cb.appendChild(p.getUi());
      this._toolboxPanel.appendChild(cb);
    });
  }

  private toggleToolbox() {
    if (this._toolboxContainer !== undefined) {
      this._toolboxContainer.style.display =
        this._toolboxContainer.style.display !== 'none' ? 'none' : 'flex';
    }
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
        this.toggleConnectMode();
        break;
      }
      case 'delete': {
        this.deleteSelected();
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
      case 'zoomin': {
        this.zoom(1);
        break;
      }
      case 'zoomout': {
        this.zoom(-1);
        break;
      }
      case 'zoomreset': {
        this.zoom(0);
        break;
      }
      case 'properties': {
        this.toggleToolbox();
        break;
      }
    }
    console.log(`'${ev.detail.button.command}' button clicked.`);
  }

  private _addItemDialog?: HTMLDivElement;

  private showAddDialog() {
    if (this._addItemDialog === undefined) {
      this._addItemDialog = document.createElement('div');
      this._addItemDialog.className = 'add-item-dialog';
      this._addItemDialog.style.pointerEvents = 'auto';

      const stencilTypeList = document.createElement('ul');
      this._addItemDialog.appendChild(stencilTypeList);

      this._stencilEditorSet.stencilSet.stencilTypes.forEach((st) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';
        const thumbnail = st.stencilType.getThumbnail(150, 100);
        listItem.appendChild(thumbnail);
        const title = document.createElement('p');
        title.className = 'stencil-title';
        title.innerText = st.displayName ?? st.stencilType.title;
        listItem.appendChild(title);
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
  }

  private addDialogStencilTypeClicked(ev: MouseEvent) {
    const listItem = <HTMLLIElement>ev.currentTarget;

    const stencilType = listItem.getAttribute('data-stencil-type');
    if (stencilType) {
      this.createNewStencil(stencilType);
    }

    this.hideAddDialog();
  }

  private hideAddDialog() {
    if (this._addItemDialog) {
      this._internalUiContainer.removeChild(this._addItemDialog);
      this._addItemDialog = undefined;
    }
  }

  private toggleConnectMode() {
    if (this.mode === 'connect') {
      this.switchConnectModeOff();
    } else {
      this.switchToConnectMode();
    }
  }

  private switchToConnectMode() {
    if (this._currentStencilEditor !== undefined) {
      this._currentStencilEditor.switchToConnectMode();
    } else {
      this.setCurrentStencil();
    }
    this.mode = 'connect';
  }

  private switchConnectModeOff() {
    this.mode = 'select';
    if (this._currentStencilEditor !== undefined) {
      this._currentStencilEditor.switchConnectModeOff();
      this._currentStencilEditor.focus();
    }
  }

  private deleteSelected() {
    if (this._currentConnectorEditor !== undefined) {
      // delete connector
      this.deleteConnector(this._currentConnectorEditor);
    } else if (this._selectedStencilEditors.length > 0) {
      this._selectedStencilEditors.forEach((se) =>
        this.deleteStencilEditor(se)
      );
      this.deselectStencil();
    }
  }

  private findConnectorEditor(
    connector: ConnectorBase
  ): ConnectorBaseEditor | undefined {
    return this._connectorEditors.find((ce) => ce.connector === connector);
  }

  private deleteStencilEditor(stencilEditor: StencilBaseEditor): void {
    stencilEditor.stencil.ports.forEach((port) => {
      // copy connectors to avoid removal side-effects
      const cCopy = new Array<ConnectorBase>(...port.connectors);
      cCopy.forEach((c) => {
        const ce = this.findConnectorEditor(c);
        if (ce !== undefined) {
          this.deleteConnector(ce);
        }
      });
    });

    if (this._objectLayer?.contains(stencilEditor.stencil.container)) {
      this._objectLayer.removeChild(stencilEditor.stencil.container);
    }
    const sei = this._stencilEditors.indexOf(stencilEditor);
    if (sei > -1) {
      this._stencilEditors.splice(sei, 1);
    }
  }

  private deleteConnector(connectorEditor: ConnectorBaseEditor) {
    connectorEditor.connector.startPort?.removeConnector(
      connectorEditor.connector
    );
    connectorEditor.connector.endPort?.removeConnector(
      connectorEditor.connector
    );

    if (this._objectLayer?.contains(connectorEditor.connector.container)) {
      this._objectLayer.removeChild(connectorEditor.connector.container);
    } else if (
      this._connectorLayer?.contains(connectorEditor.connector.container)
    ) {
      this._connectorLayer.removeChild(connectorEditor.connector.container);
    }

    const cei = this._connectorEditors.indexOf(connectorEditor);
    if (cei > -1) {
      this._connectorEditors.splice(cei, 1);
    }

    if (this._currentConnectorEditor === connectorEditor) {
      this._currentConnectorEditor = undefined;
    }
  }

  private width = 0;
  private height = 0;

  private documentWidth = 640;
  private documentHeight = 360;

  private addMainCanvas() {
    this.width = this._contentContainer?.clientWidth || 0;
    this.height = this._contentContainer?.clientHeight || 0;

    this._mainCanvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    this._mainCanvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this._mainCanvas.setAttribute('width', this.documentWidth.toString());
    this._mainCanvas.setAttribute('height', this.documentHeight.toString());
    this._mainCanvas.setAttribute(
      'viewBox',
      '0 0 ' +
        this.documentWidth.toString() +
        ' ' +
        this.documentHeight.toString()
    );
    this._mainCanvas.style.gridColumnStart = '1';
    this._mainCanvas.style.gridRowStart = '1';
    this._mainCanvas.style.pointerEvents = 'auto';
    this._mainCanvas.style.backgroundColor = 'white';
    this._mainCanvas.style.filter = 'drop-shadow(2px 2px 8px #333)';
    this._mainCanvas.style.transform = `scale(${this._zoomLevel})`;

    this._groupLayer = SvgHelper.createGroup();
    this._connectorLayer = SvgHelper.createGroup();
    this._objectLayer = SvgHelper.createGroup();

    this._mainCanvas.appendChild(this._groupLayer);
    this._mainCanvas.appendChild(this._connectorLayer);
    this._mainCanvas.appendChild(this._objectLayer);

    this._canvasContainer?.appendChild(this._mainCanvas);
  }

  private initOverlay(): void {
    this._overlayContainer = document.createElement('div');
    this._overlayContainer.style.pointerEvents = 'none';
    this._overlayContainer.style.display = 'flex';
    this._overlayContainer.style.alignItems = 'center';
    this._overlayContainer.style.justifyContent = 'center';
    this._overlayContainer.style.gridRowStart = '1';
    this._overlayContainer.style.gridColumnStart = '1';

    this._canvasContainer?.appendChild(this._overlayContainer);

    this._overlayContentContainer = document.createElement('div');
    this._overlayContentContainer.style.position = 'relative';
    this._overlayContentContainer.style.width = `${this.documentWidth}px`;
    this._overlayContentContainer.style.height = `${this.documentHeight}px`;
    this._overlayContentContainer.style.display = 'flex';
    this._overlayContainer.appendChild(this._overlayContentContainer);
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
    this._internalUiContainer.style.alignItems = 'center';
    this._internalUiContainer.style.zIndex = '10';
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
    this._mainCanvas?.addEventListener('pointerdown', this.onCanvasPointerDown);
    this._mainCanvas?.addEventListener('pointermove', this.onCanvasPointerMove);
    this._mainCanvas?.addEventListener('pointerup', this.onCanvasPointerUp);
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
    this._mainCanvas?.removeEventListener(
      'pointerdown',
      this.onCanvasPointerDown
    );
    this._mainCanvas?.removeEventListener(
      'pointerdown',
      this.onCanvasPointerUp
    );
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

  private selectHitEditor(
    ev: PointerEvent,
    localCoordinates: IPoint
  ): StencilBaseEditor | undefined {
    const hitEditor = this.getHitEditor(ev.target);
    if (hitEditor !== undefined) {
      this.deselectCurrentConnector();
      if (ev.shiftKey) {
        this.selectStencil(hitEditor);
      } else if (!hitEditor.isSelected) {
        this.deselectStencil();
        this.selectStencil(hitEditor);
        this.setCurrentStencil(hitEditor);
        if (this._currentStencilEditor !== undefined) {
          this._currentStencilEditor.focus();
        }
      }

      this.isDragging = true;
      hitEditor.pointerDown(localCoordinates, ev.target ?? undefined);

      this._selectedStencilEditors.forEach((se) => {
        if (se !== hitEditor) {
          se.state = 'move';
          se.initManipulation(localCoordinates);
        }
      });
    } else {
      this.deselectStencil();
      this.isDragging = true;
      // @todo
      // this.prevPanPoint = { x: ev.clientX, y: ev.clientY };
    }

    return hitEditor;
  }

  private pushToConnectorLayer(connectorEditor: ConnectorBaseEditor) {
    if (this._objectLayer?.contains(connectorEditor.connector.container)) {
      this._objectLayer?.removeChild(connectorEditor.connector.container);
      this._connectorLayer?.appendChild(connectorEditor.connector.container);
    }
  }

  private popFromConnectorLayer(connectorEditor: ConnectorBaseEditor) {
    if (this._connectorLayer?.contains(connectorEditor.connector.container)) {
      this._connectorLayer?.removeChild(connectorEditor.connector.container);
      this._objectLayer?.appendChild(connectorEditor.connector.container);
    }
  }

  private deselectCurrentConnector() {
    if (this._currentConnectorEditor !== undefined) {
      this._currentConnectorEditor.deselect();
      this.pushToConnectorLayer(this._currentConnectorEditor);
      this._currentConnectorEditor = undefined;
    }
  }

  private selectHitConnector(
    ev: PointerEvent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    localCoordinates: IPoint
  ): ConnectorBaseEditor | undefined {
    const hitConnector = this.getHitConnector(ev.target);
    if (hitConnector !== undefined) {
      if (this._currentConnectorEditor !== hitConnector) {
        this.deselectStencil();
        this._currentConnectorEditor = hitConnector;
        this.popFromConnectorLayer(this._currentConnectorEditor);
        hitConnector.select();
      }
    } else {
      this.deselectCurrentConnector();
    }

    return hitConnector;
  }

  private onCanvasPointerDown(ev: PointerEvent) {
    // @todo
    // if (!this._isFocused) {
    //   this.focus();
    // }

    this._manipulationStartX = ev.clientX;
    this._manipulationStartY = ev.clientY;

    const localCoordinates = this.clientToLocalCoordinates(
      ev.clientX,
      ev.clientY
    );

    this.touchPoints++;
    if (this.touchPoints === 1 || ev.pointerType !== 'touch') {
      if (
        this._currentStencilEditor !== undefined &&
        (this._currentStencilEditor.state === 'new' ||
          this._currentStencilEditor.state === 'creating')
      ) {
        this.isDragging = true;
        this._currentStencilEditor.pointerDown(localCoordinates);
      } else if (this.mode === 'select' && ev.target) {
        const hitEditor = this.selectHitEditor(ev, localCoordinates);
        if (hitEditor === undefined) {
          const hitConnector = this.selectHitConnector(ev, localCoordinates);
          hitConnector?.pointerDown(localCoordinates, ev.target);
        }
      } else if (this.mode === 'connect' && ev.target) {
        const hitEditor = this.getHitEditor(ev.target);
        if (hitEditor !== undefined) {
          this.connectionStartPort = hitEditor.getTargetPort(ev.target);
          if (this.connectionStartPort !== undefined) {
            this.deselectStencil();
            this.deselectCurrentConnector();
            this._currentConnectorEditor = this.addNewConnector(ConnectorBase);
            this._currentConnectorEditor.onConnectorCreated =
              this.connectorCreated;
            this._currentConnectorEditor.onConnectorUpdated =
              this.connectorUpdated;
            this._currentConnectorEditor.connector.startStencil =
              hitEditor.stencil;
            this._currentConnectorEditor.connector.startPort =
              this.connectionStartPort.port;
            this._currentConnectorEditor.pointerDown(
              {
                x: hitEditor.stencil.left + this.connectionStartPort.port.x,
                y: hitEditor.stencil.top + this.connectionStartPort.port.y,
              },
              ev.target
            );
            console.log(this.connectionStartPort);
          } else {
            this.mode = 'select';
            hitEditor.switchConnectModeOff();
            this.selectHitEditor(ev, localCoordinates);
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
      const hitEditor = this.getHitEditor(ev.target);
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

        const localCoordinates = this.clientToLocalCoordinates(
          ev.clientX,
          ev.clientY
        );
        if (this._currentStencilEditor !== undefined) {
          this._currentStencilEditor.manipulate(localCoordinates);
        }
        if (this._selectedStencilEditors.length > 1) {
          this._selectedStencilEditors.forEach((se) =>
            se.manipulate(localCoordinates)
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
        );
      }
    }
  }

  private onCanvasPointerMove(ev: PointerEvent) {
    const hitEditor = this.getHitEditor(ev.target);
    if (this._currentHitEditor !== hitEditor) {
      // hovered editor changed
      if (hitEditor !== undefined) {
        if (!hitEditor.isSelected) {
          this.mode = 'connect';
          hitEditor.switchToConnectMode();
        }
      } else if (this._currentHitEditor !== undefined /*&& !this.isDragging*/) {
        this.mode = 'select';
        if (this._currentHitEditor.state === 'connect') {
          this._currentHitEditor.switchConnectModeOff();
        }
      }
      this._currentHitEditor = hitEditor;
    }
  }

  private removeConnectorFromPort(connector: ConnectorBase, port?: Port) {
    if (port !== undefined) {
      const pi = port.connectors.indexOf(connector);
      if (pi > -1) {
        port.connectors.splice(pi, 1);
      }
    }
  }

  private onCanvasPointerUp(ev: PointerEvent) {
    if (this.mode === 'connect' && ev.target) {
      const hitEditor = this.getHitEditor(ev.target);
      if (hitEditor !== undefined) {
        const targetPort = hitEditor.getTargetPort(ev.target);
        if (
          this._currentConnectorEditor !== undefined &&
          targetPort !== undefined
        ) {
          if (this._currentConnectorEditor.state === 'creating') {
            this.connectionEndPort = targetPort;
            this._currentConnectorEditor.connector.endStencil =
              hitEditor.stencil;
            this._currentConnectorEditor.connector.endPort =
              this.connectionEndPort.port;
            this._currentConnectorEditor.pointerUp({
              x: hitEditor.stencil.left + this.connectionEndPort.port.x,
              y: hitEditor.stencil.top + this.connectionEndPort.port.y,
            });
            console.log(this.connectionEndPort);
          } else if (this._currentConnectorEditor.state === 'move') {
            if (
              this._currentConnectorEditor.movingPort ===
              this._currentConnectorEditor.connector.endPort
            ) {
              if (
                this._currentConnectorEditor.connector.endPort !==
                targetPort.port
              ) {
                this.removeConnectorFromPort(
                  this._currentConnectorEditor.connector,
                  this._currentConnectorEditor.connector.endPort
                );
                this._currentConnectorEditor.connector.endStencil =
                  hitEditor.stencil;
                this._currentConnectorEditor.connector.endPort =
                  targetPort.port;
              }
            } else if (
              this._currentConnectorEditor.movingPort ===
              this._currentConnectorEditor.connector.startPort
            ) {
              this.removeConnectorFromPort(
                this._currentConnectorEditor.connector,
                this._currentConnectorEditor.connector.startPort
              );
              this._currentConnectorEditor.connector.startStencil =
                hitEditor.stencil;
              this._currentConnectorEditor.connector.startPort =
                targetPort.port;
            }
            this._currentConnectorEditor.pointerUp({
              x: hitEditor.stencil.left + targetPort.port.x,
              y: hitEditor.stencil.top + targetPort.port.y,
            });
            console.log(targetPort);
          }
        } else if (
          this._currentConnectorEditor !== undefined &&
          this._currentConnectorEditor.state === 'move'
        ) {
          // reset connector when released of stencil as if it didn't move
          this._currentConnectorEditor.pointerUp({ x: 0, y: 0 });
        } 
      }
    } else if (
      this._currentConnectorEditor !== undefined &&
      this._currentConnectorEditor.state === 'move'
    ) {
      // reset connector when released of stencil as if it didn't move
      this._currentConnectorEditor.pointerUp({ x: 0, y: 0 });
    }
  }

  private _currentHitEditor?: StencilBaseEditor;
  private getHitEditor(target: EventTarget | null) {
    return this._stencilEditors.find((m) => m.ownsTarget(target));
  }
  private getHitConnector(target: EventTarget | null) {
    return this._connectorEditors.find((m) => m.ownsTarget(target));
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
    const sType =
      this._stencilEditorSet.stencilSet.getStencilProperties(steniclType);

    if (sType) {
      this.deselectStencil();
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
    this.selectStencil(stencilEditor);
    this.setCurrentStencil(stencilEditor);

    // @todo
    // this.toolbar.setSelectMode();
    // this.addUndoStep();
    // this.eventListeners['markercreate'].forEach((listener) =>
    //   listener(new MarkerEvent(this, this.currentMarker))
    // );
  }

  private stencilChanged(stencilEditor: StencilBaseEditor) {
    stencilEditor.stencil.ports.forEach((port) => {
      if (port.enabled) {
        port.connectors.forEach((c) => c.adjust());
      }
    });
  }

  private connectorCreated(connectorEditor: ConnectorBaseEditor) {
    connectorEditor.connector.startPort?.connectors.push(
      connectorEditor.connector
    );
    connectorEditor.connector.endPort?.connectors.push(
      connectorEditor.connector
    );
    this._connectorEditors.push(connectorEditor);
    this.pushToConnectorLayer(connectorEditor);
    this.deselectCurrentConnector();
  }

  private connectorUpdated(connectorEditor: ConnectorBaseEditor) {
    connectorEditor.connector.startPort?.connectors.push(
      connectorEditor.connector
    );
    connectorEditor.connector.endPort?.connectors.push(
      connectorEditor.connector
    );
    this.pushToConnectorLayer(connectorEditor);
    this.deselectCurrentConnector();
  }

  public setCurrentStencil(stencilEditor?: StencilBaseEditor): void {
    if (this._currentStencilEditor !== stencilEditor) {
      // no need to deselect if not changed
      if (this._currentStencilEditor !== undefined) {
        this._currentStencilEditor.blur();
        // @todo
        // this.toolbar.setCurrentMarker();
        this.addToolboxPanels([]);
      }
    }
    this._currentStencilEditor = stencilEditor;
    if (
      this._currentStencilEditor !== undefined &&
      !this._currentStencilEditor.isFocused
    ) {
      if (this._currentStencilEditor.state !== 'new') {
        this._currentStencilEditor.focus();
      }
      // @todo
      // this.toolbar.setCurrentMarker(this.currentMarker);
      this.addToolboxPanels(this._currentStencilEditor.propertyPanels);
    }
  }

  public selectStencil(stencilEditor: StencilBaseEditor): void {
    if (this._selectedStencilEditors.indexOf(stencilEditor) < 0) {
      this._selectedStencilEditors.push(stencilEditor);
      stencilEditor.select();
      if (this._selectedStencilEditors.length > 1) {
        this.setCurrentStencil();
      }
    } else {
      this.deselectStencil(stencilEditor);
    }
  }

  public deselectStencil(stencilEditor?: StencilBaseEditor): void {
    if (stencilEditor !== undefined) {
      const i = this._selectedStencilEditors.indexOf(stencilEditor);
      if (i > -1) {
        this._selectedStencilEditors[i].deselect();
        this._selectedStencilEditors.splice(i, 1);
        if (this._selectedStencilEditors.length === 1) {
          this.setCurrentStencil(this._selectedStencilEditors[0]);
        }
      }
    } else {
      // remove all
      this._selectedStencilEditors.forEach((se) => se.deselect());
      this._selectedStencilEditors.splice(0);
      this.setCurrentStencil();
    }
  }

  private addNewStencil(stencilType: typeof StencilBase): StencilBaseEditor {
    const g = SvgHelper.createGroup();
    this._objectLayer?.appendChild(g);

    const editor = this._stencilEditorSet.getStencilEditor(stencilType);

    return new editor(
      this.getNewIId(),
      g,
      this._overlayContentContainer,
      stencilType
    );
  }

  private addNewConnector(
    connectorType: typeof ConnectorBase,
    toLayer?: SVGGElement
  ): ConnectorBaseEditor {
    const g = SvgHelper.createGroup();
    toLayer?.appendChild(g) ?? this._objectLayer?.appendChild(g);

    const connectorEditorType =
      this._stencilEditorSet.getConnectorEditor(connectorType);
    return new connectorEditorType(
      this.getNewIId(),
      g,
      this._overlayContentContainer,
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

  public getState(): DiagramState {
    const result: DiagramState = {
      width: this.width,
      height: this.height,

      stencils: [],
      connectors: [],
    };

    this._stencilEditors.forEach((se) =>
      result.stencils.push(se.stencil.getState())
    );
    this._connectorEditors.forEach((ce) =>
      result.connectors.push(ce.connector.getState())
    );

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
      const stencilType =
        this._stencilEditorSet.stencilSet.getStencilProperties(
          stencilState.typeName
        );
      if (stencilType !== undefined) {
        const stencilEditor = this.addNewStencil(stencilType.stencilType);
        stencilEditor.restoreState(stencilState);
        this._iid = Math.max(this._iid, stencilEditor.stencil.IId); // adjust current iid counter
        stencilEditor.onStencilChanged = this.stencilChanged;
        this._stencilEditors.push(stencilEditor);
      }
    });

    state.connectors.forEach((conState) => {
      const cp = this._stencilEditorSet.stencilSet.getConnectorProperties(
        conState.typeName
      );
      if (cp !== undefined) {
        const startStencil = this._stencilEditors.find(
          (se) => se.stencil.IId === conState.startStencilId
        );
        const endStencil = this._stencilEditors.find(
          (se) => se.stencil.IId === conState.endStencilId
        );

        if (
          startStencil &&
          endStencil &&
          conState.startPortLocation &&
          conState.endPortLocation
        ) {
          const startPort = startStencil.stencil.ports.get(
            conState.startPortLocation
          );
          const endPort = endStencil.stencil.ports.get(
            conState.endPortLocation
          );

          if (startPort && endPort) {
            const conEditor = this.addNewConnector(
              cp.connectorType,
              this._connectorLayer
            );
            conEditor.onConnectorUpdated = this.connectorUpdated;
            conEditor.restoreState(conState, {
              startStencil: startStencil.stencil,
              startPort: startPort,
              endStencil: endStencil.stencil,
              endPort: endPort,
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

  public async render(
    width?: number,
    height?: number,
    imageType = 'image/png',
    quality?: number
  ): Promise<string | undefined> {
    // this.setCurrentMarker();

    if (this._mainCanvas !== undefined) {
      const renderer = new Renderer();
      renderer.imageType = imageType;
      renderer.imageQuality = quality;
      renderer.width = width;
      renderer.height = height;

      // workaround for an issue in Safari where FreeHand marker
      // is not rendered on the first try for some reason
      // await renderer.rasterize(this._mainCanvas);

      return await renderer.rasterize(this._mainCanvas);
    } else {
      return undefined;
    }
  }
}
