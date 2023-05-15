import {
  Button,
  Panel,
  Toolbar,
  ToolbarBlock,
  ButtonEventData,
} from '@markerjs/mjs-toolbar';
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
import { Port } from './core/Port';
import { Renderer } from './editor/Renderer';
import { UndoRedoManager } from './editor/UndoRedoManager';
import { ConnectorTypePanel } from './editor/panels/ConnectorTypePanel';
import { ConnectorBaseState } from './core/ConnectorBaseState';
import { NewStencilPanel } from './editor/panels/NewStencilPanel';
import { AlignPanel, VerticalAlignment, HorizontalAlignment } from './editor/panels/AlignPanel';
import { StencilEditorSet } from './editor';

import Logo from './assets/markerjs-logo-m.svg';
import { Activator } from './core/Activator';
import { ColorPickerPanel } from './editor/panels/ColorPickerPanel';
import { DimensionsPanel } from './editor/panels/DimensionsPanel';
import { EditorSettings } from './editor/EditorSettings';
import { Language } from './editor/Language';
import en_core_strings from './editor/lang/en';
import { ArrangePanel, ArrangementType } from './editor/panels/ArrangePanel';

export type DiagramEditorMode = 'select' | 'connect';

export interface DiagramEditorEventMap {
  saveclick: CustomEvent<RenderEventData>;
  editorinit: CustomEvent<DiagramEditorEventData>;
  diagramload: CustomEvent<DiagramEditorEventData>;
  statechange: CustomEvent<DiagramEditorEventData>;
  stencilpointerenter: CustomEvent<StencilEditorEventData>;
  stencilpointerleave: CustomEvent<StencilEditorEventData>;
  stencilclick: CustomEvent<StencilEditorEventData>;
  connectorpointerenter: CustomEvent<ConnectorEditorEventData>;
  connectorpointerleave: CustomEvent<ConnectorEditorEventData>;
  connectorclick: CustomEvent<ConnectorEditorEventData>;
}

export interface RenderEventData {
  state: DiagramState;
}

export interface DiagramEditorEventData {
  editor: DiagramEditor;
}

export interface StencilEditorEventData {
  diagramEditor: DiagramEditor;
  stencilEditor: StencilBaseEditor;
}
export interface ConnectorEditorEventData {
  diagramEditor: DiagramEditor;
  connectorEditor: ConnectorBaseEditor;
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

  private _logoUI?: HTMLElement;

  private mode: DiagramEditorMode = 'select';

  private _mainCanvas?: SVGSVGElement;
  private _groupLayer?: SVGGElement;
  private _connectorLayer?: SVGGElement;
  private _objectLayer?: SVGGElement;

  private _currentStencilEditor?: StencilBaseEditor;
  private _selectedStencilEditors: StencilBaseEditor[] = [];
  private _stencilEditors: StencilBaseEditor[] = [];

  private _currentConnectorType: typeof ConnectorBase = ConnectorBase;
  private _currentConnectorEditor?: ConnectorBaseEditor;
  private _connectorEditors: ConnectorBaseEditor[] = [];
  private _connectorTypePanel!: ConnectorTypePanel;
  private _newStencilPanel!: NewStencilPanel;
  private _alignPanel!: AlignPanel;
  private _arrangePanel!: ArrangePanel;

  private _documentBackgroundPanel!: ColorPickerPanel;
  private _documentDimensionsPanel!: DimensionsPanel;

  private _newStencilOutline: SVGPathElement = SvgHelper.createPath('', [
    ['stroke', '#333'],
    ['stroke-width', '0.5'],
    ['stroke-dasharray', '2 5'],
    ['fill', 'rgba(200,200,200,0.1)'],
    ['pointer-events', 'none'],
  ]);

  private _marqueeSelectOutline: SVGRectElement = SvgHelper.createRect(0, 0, [
    ['stroke', '#333'],
    ['stroke-width', '0.5'],
    ['stroke-dasharray', '5 5'],
    ['fill', 'transparent'],
    ['pointer-events', 'none'],
  ]);
  private _marqueeSelectRect = new DOMRect(0, 0, 0, 0);

  public zoomSteps = [0.5, 0.8, 1, 1.5, 2, 4];
  private _zoomLevel = 1;
  public get zoomLevel(): number {
    return this._zoomLevel;
  }
  public set zoomLevel(value: number) {
    this._zoomLevel = value;
    if (
      this._canvasContainer &&
      this._contentContainer &&
      this._mainCanvas &&
      this._overlayContainer
    ) {
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

      this._overlayContainer.style.transform = `scale(${this._zoomLevel})`;
    }
  }

  private _stencilEditorSet = basicStencilEditorSet;
  public get stencilEditorSet(): StencilEditorSet {
    return this._stencilEditorSet;
  }
  public set stencilEditorSet(value: StencilEditorSet) {
    this._stencilEditorSet = value;
    this._currentConnectorType = value.defaultConnectorType ?? ConnectorBase;
    if (value.defaultStringSet !== undefined) {
      this.language.addStrings(value.id, 'en', value.defaultStringSet);
    }
    this.applyStencilSet();
    this.dispatchEvent(
      new CustomEvent<DiagramEditorEventData>('editorinit', {
        detail: { editor: this },
      })
    );
  }

  private _toolboxPanel!: HTMLDivElement;

  protected _manipulationStartX = 0;
  protected _manipulationStartY = 0;

  private undoRedoManager: UndoRedoManager<DiagramState> =
    new UndoRedoManager<DiagramState>();

  public readonly settings: EditorSettings = new EditorSettings();

  public readonly language = new Language();

  constructor() {
    super();

    this.stencilCreated = this.stencilCreated.bind(this);
    this.stencilChanged = this.stencilChanged.bind(this);
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
    this.onCanvasPointerOut = this.onCanvasPointerOut.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);
    this.toolbarButtonClicked = this.toolbarButtonClicked.bind(this);

    this.toggleConnectMode = this.toggleConnectMode.bind(this);
    this.switchToConnectMode = this.switchToConnectMode.bind(this);
    this.switchConnectModeOff = this.switchConnectModeOff.bind(this);

    this.selectHitEditor = this.selectHitEditor.bind(this);
    this.selectHitConnector = this.selectHitConnector.bind(this);

    this.addStyles = this.addStyles.bind(this);

    this.addToolboxPanels = this.addToolboxPanels.bind(this);
    this.toggleToolbox = this.toggleToolbox.bind(this);
    this.removeToolboxPanels = this.removeToolboxPanels.bind(this);

    this.deleteSelected = this.deleteSelected.bind(this);
    this.deleteConnector = this.deleteConnector.bind(this);
    this.deleteStencilEditor = this.deleteStencilEditor.bind(this);
    this.findConnectorEditor = this.findConnectorEditor.bind(this);

    this.addMainCanvas = this.addMainCanvas.bind(this);
    this.setMainCanvasSize = this.setMainCanvasSize.bind(this);

    this.changeConnectorType = this.changeConnectorType.bind(this);

    this.showAddPanel = this.showAddPanel.bind(this);
    this.createNewStencil = this.createNewStencil.bind(this);
    this.addNewStencil = this.addNewStencil.bind(this);

    this.showDocumentPropertiesPanel =
      this.showDocumentPropertiesPanel.bind(this);
    this.setDocumentBgColor = this.setDocumentBgColor.bind(this);
    this.setDocumentSize = this.setDocumentSize.bind(this);

    this.zoom = this.zoom.bind(this);

    this.undo = this.undo.bind(this);
    this.addUndoStep = this.addUndoStep.bind(this);
    this.undoStep = this.undoStep.bind(this);
    this.redo = this.redo.bind(this);
    this.redoStep = this.redoStep.bind(this);

    this.applyStencilSet = this.applyStencilSet.bind(this);
    this.setupPanels = this.setupPanels.bind(this);

    this.addLogo = this.addLogo.bind(this);
    this.removeLogo = this.removeLogo.bind(this);
    this.positionLogo = this.positionLogo.bind(this);

    this.finishMarqueeSelection = this.finishMarqueeSelection.bind(this);

    this.alignHorizontally = this.alignHorizontally.bind(this);
    this.alignVertically = this.alignVertically.bind(this);
    this.arrange = this.arrange.bind(this);

    this.attachShadow({ mode: 'open' });

    this.addStyles();
  }

  private _iid = 0;
  public getNewIId(): number {
    return ++this._iid;
  }

  private setupPanels() {
    this._connectorTypePanel = new ConnectorTypePanel(
      this.language.getString('toolbox-connectortype-title') ??
        'Connector type',
      this.language,
      this._stencilEditorSet.availableConnectorTypes,
      this._currentConnectorType
    );
    this._connectorTypePanel.onConnectorTypeChanged = this.changeConnectorType;

    this._stencilEditorSet.stencilSet.stencilTypes.forEach((st) => {
      st.displayName =
        this.language.getString(
          `${st.stencilType.typeName}-displayname`,
          this._stencilEditorSet.id
        ) ?? st.displayName;
    });
    this._newStencilPanel = new NewStencilPanel(
      this.language.getString('toolbox-newstencil-title') ?? 'Create new',
      this.language,
      this._stencilEditorSet.stencilSet.stencilTypes
    );
    this._newStencilPanel.onCreateNewStencil = this.createNewStencil;

    this._documentBackgroundPanel = new ColorPickerPanel(
      this.language.getString('toolbox-bgcolor-title') ?? 'Background color',
      this.language,
      this.settings.defaultBackgroundColorSet,
      this.settings.defaultBackgroundColor
    );
    this._documentBackgroundPanel.onColorChanged = this.setDocumentBgColor;

    this._documentDimensionsPanel = new DimensionsPanel(
      this.language.getString('toolbox-docsize-title') ?? 'Document size',
      this.language,
      this.documentWidth,
      this.documentHeight
    );
    this._documentDimensionsPanel.onDimensionsChanged = this.setDocumentSize;

    this._alignPanel = new AlignPanel(
      this.language.getString('toolbox-align-title') ?? 'Align',
      this.language,
    );
    this._alignPanel.onHorizontalAlignmentClicked = this.alignHorizontally;
    this._alignPanel.onVerticalAlignmentClicked = this.alignVertically;

    this._arrangePanel = new ArrangePanel(
      this.language.getString('toolbox-arrange-title') ?? 'Arrange',
      this.language,
    );
    this._arrangePanel.onArrangeClicked = this.arrange;
  }

  private addStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
      * {
        --i-mjsdiae-fore-color: var(--mjsdiae-fore-color, #eee);
        --i-mjsdiae-accent-color: var(--mjsdiae-accent-color, #cceeff);
        --i-mjsdiae-accent-color2: var(--mjsdiae-accent-color2, #335577);
        --i-mjsdiae-background-color: var(--mjsdiae-background-color, #333);
        --i-mjsdiae-background-color-hover: var(--mjsdiae-background-color-hover, #383838);
        --i-mjsdiae-border-color: var(--mjsdiae-border-color, --i-mjsdiae-background-color);
        --i-mjsdiae-border-color-hover: var(--mjsdiae-border-color-hover, #222);
        --i-mjsdiae-panel-border-color: var(--mjsdiae-panel-border-color, #383838);
        --i-mjsdiae-panel-separator-color: var(--mjsdiae-panel-separator-color, #444);
        --i-mjsdiae-input-background-color: var(--mjsdiae-input-background-color, #222);
        --i-mjsdiae-input-background-color-focus: var(--mjsdiae-input-background-color-focus, #444);
        --i-mjsdiae-input-fore-color: var(--mjsdiae-input-fore-color, --i-mjsdiae-fore-color);

        --i-mjsdiae-newstencil-background-color: var(--mjsdiae-newstencil-background-color, #444);
        --i-mjsdiae-newstencil-background-color-hover: var(--mjsdiae-newstencil-background-color-hover, #888);
        
        --i-mjsdiae-canvas-background-color: var(--mjsdiae-canvas-background-color, #aaa);
      }

      .canvas-container {
        background-color: var(--i-mjsdiae-canvas-background-color);
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

      mjstb-panel.toolbar-panel::part(panel) {
        background-color: var(--i-mjsdiae-background-color);
        border-bottom: 2px solid var(--i-mjsdiae-panel-border-color);
      }
      mjstb-panel.toolbar-panel::part(toolbar) {
        padding: 5px;
        justify-content: space-between;
      }
      mjstb-panel.toolbar-panel::part(toolbar-block) {
      }
      mjstb-panel.toolbar-panel::part(button) {
        color: var(--i-mjsdiae-fore-color);
        background-color: var(--i-mjsdiae-background-color);
        width: 36px;
        height: 36px;
        border-radius: 3px;
        border: 2px solid var(--i-mjsdiae-border-color);
      }
      mjstb-panel.toolbar-panel::part(button):hover {
        background-color: var(--i-mjsdiae-background-color-hover);
        border-color: var(--i-mjsdiae-border-color-hover);
      }

      .toolbox-panel {
        width: 100%;
        background-color: var(--i-mjsdiae-background-color);
        border-left: 2px solid var(--i-mjsdiae-panel-border-color);
        filter: drop-shadow(-2px 0px 4px var(--i-mjsdiae-panel-border-color));
        padding: 2px;
        scrollbar-width: thin;
        overflow-y: auto;
        font-family: Helvetica, Arial, sans-serif;
      }
      .toolbox-panel::-webkit-scrollbar {
        width: 12px;
      }
      .toolbox-panel::-webkit-scrollbar-track {
        background: var(--i-mjsdiae-background-color);
      }
      
      .toolbox-panel::-webkit-scrollbar-thumb {
        background-color: #444;
        border-radius: 20px;
        border: 1px solid #222;
      }

      .toolbox-panel .content-block {
        background-color: var(--i-mjsdiae-background-color);
        color: var(--i-mjsdiae-fore-color);
        font-size: 0.8rem;
        padding: 5px;
        border-bottom: 2px solid var(--i-mjsdiae-panel-separator-color);
        border-radius: 3px;
        overflow: hidden;
      }
      .toolbox-panel .content-block input[type=text] {
        background-color: var(--i-mjsdiae-input-background-color);
        color: var(--i-mjsdiae-input-fore-color);
        font-size: 0.8rem;
        padding: 3px;
        border: 1px solid var(--i-mjsdiae-input-background-color);
        outline-color: var(--i-mjsdiae-input-background-color-focus);
        outline-style: solid;
        outline-width: 1px;
      }
      .toolbox-panel .content-block input[type=text]:focus {
        background-color: var(--i-mjsdiae-input-background-color-focus);
      }
      .toolbox-panel .content-block select {
        background-color: var(--i-mjsdiae-input-background-color);
        color: var(--i-mjsdiae-input-fore-color);
        font-size: 0.8rem;
        padding: 3px;
        border: 1px solid var(--i-mjsdiae-input-background-color);
        outline-color: var(--i-mjsdiae-input-background-color-focus);
        outline-style: solid;
        outline-width: 1px;
      }
      .toolbox-panel .content-block select:focus {
        background-color: var(--i-mjsdiae-input-background-color-focus);
      }
      .toolbox-panel .content-block button {
        background-color: var(--i-mjsdiae-input-background-color-focus);
        color: var(--i-mjsdiae-input-fore-color);
        font-size: 0.8rem;
        padding: 3px;
        border: 1px solid var(--i-mjsdiae-input-background-color);
        outline-color: var(--i-mjsdiae-input-background-color);
        outline-style: solid;
        outline-width: 1px;
      }
      .toolbox-panel .content-block button:hover {
        background-color: var(--i-mjsdiae-input-background-color);
      }      

      .toolbox-panel .content-block h3 {
        font-size: 0.8rem;
        margin-bottom: 2px;
      }

      .toolbox-panel .content-block-title {
        margin: -5px;
        margin-bottom: 5px;
        padding: 5px;
        border-bottom: 1px solid var(--i-mjsdiae-panel-separator-color);
        color: var(--i-mjsdiae-fore-color);
        font-family: Helvetica, Arial, Sans-Serif;
        font-size: 0.8rem;
      }
      .toolbox-panel .new-stencil-block {
        padding: 0;
        background-color: var(--i-mjsdiae-newstencil-background-color);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        width: 100px;
        margin-bottom: 5px;
        margin-right: 5px;
        align-items: center;
        border-width: 2px;
        border-style: solid;
        border-radius: 4px;
        cursor: pointer;
      }
      .toolbox-panel .new-stencil-block:hover {
        background-color: var(--i-mjsdiae-newstencil-background-color-hover);
      }
      .toolbox-panel .new-stencil-block .new-stencil-block-thumbnail {
        stroke-width: 0.5px;
        fill: var(--i-mjsdiae-accent-color2);
        stroke: var(--i-mjsdiae-border-color);
        color: #000;
        margin: 10px;
      }
      .toolbox-panel .new-stencil-block .new-stencil-block-title {
        align-self: stretch;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.7rem;
        text-align: center;
        margin: 5px 0 0 0;
        padding: 3px;
        background-color: var(--i-mjsdiae-accent-color2);
        color: var(--i-mjsdiae-fore-color);
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
    this._canvasContainer.style.touchAction = 'pinch-zoom';
    this._canvasContainer.className = 'canvas-container';
    this._canvasContainer.style.display = 'grid';
    this._canvasContainer.style.gridTemplateColumns = '1fr';
    this._canvasContainer.style.flexGrow = '2';
    this._canvasContainer.style.flexShrink = '2';
    this._canvasContainer.style.justifyItems = 'center';
    this._canvasContainer.style.alignItems = 'center';
    this._canvasContainer.style.overflow = 'auto';
    this._contentContainer.appendChild(this._canvasContainer);

    this._toolboxContainer = document.createElement('div');
    this._toolboxContainer.style.display = 'flex';
    this._toolboxContainer.style.minWidth = '250px';
    this._toolboxContainer.style.width = '250px';
    this._toolboxContainer.style.maxWidth = '250px';
    this._toolboxContainer.style.height = '100%';
    // this._toolboxContainer.style.zIndex = '10';
    // this._toolboxContainer.style.filter = 'drop-shadow(-2px 0px 4px #333)';

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
      text: this.language.getString('toolbar-select') ?? 'select',
      command: 'select',
    });
    actionBlock.appendButton(selectButton);

    const deleteButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
</svg>`,
      text: this.language.getString('toolbar-delete') ?? 'delete',
      command: 'delete',
    });
    actionBlock.appendButton(deleteButton);

    const saveButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3M19 19H5V5H16.17L19 7.83V19M12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12M6 6H15V10H6V6Z" />
</svg>`,
      text: this.language.getString('toolbar-save') ?? 'save',
      command: 'save',
    });
    actionBlock.appendButton(saveButton);

    const undoButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
</svg>`,
      text: this.language.getString('toolbar-undo') ?? 'undo',
      command: 'undo',
    });
    actionBlock.appendButton(undoButton);

    const redoButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.54,15.22L3.9,16C4.95,12.81 7.95,10.5 11.5,10.5C13.45,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z" />
</svg>`,
      text: this.language.getString('toolbar-redo') ?? 'redo',
      command: 'redo',
    });
    actionBlock.appendButton(redoButton);

    const addButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V6H11V8H5V17H17Z" />
</svg>`,
      text: this.language.getString('toolbar-add') ?? 'add',
      command: 'add',
    });
    createBlock.appendButton(addButton);

    const connectButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M18,11H14.82C14.4,9.84 13.3,9 12,9C10.7,9 9.6,9.84 9.18,11H6C5.67,11 4,10.9 4,9V8C4,6.17 5.54,6 6,6H16.18C16.6,7.16 17.7,8 19,8A3,3 0 0,0 22,5A3,3 0 0,0 19,2C17.7,2 16.6,2.84 16.18,4H6C4.39,4 2,5.06 2,8V9C2,11.94 4.39,13 6,13H9.18C9.6,14.16 10.7,15 12,15C13.3,15 14.4,14.16 14.82,13H18C18.33,13 20,13.1 20,15V16C20,17.83 18.46,18 18,18H7.82C7.4,16.84 6.3,16 5,16A3,3 0 0,0 2,19A3,3 0 0,0 5,22C6.3,22 7.4,21.16 7.82,20H18C19.61,20 22,18.93 22,16V15C22,12.07 19.61,11 18,11M19,4A1,1 0 0,1 20,5A1,1 0 0,1 19,6A1,1 0 0,1 18,5A1,1 0 0,1 19,4M5,20A1,1 0 0,1 4,19A1,1 0 0,1 5,18A1,1 0 0,1 6,19A1,1 0 0,1 5,20Z" />
</svg>`,
      text: this.language.getString('toolbar-connect') ?? 'connect',
      command: 'connect',
    });
    createBlock.appendButton(connectButton);

    const documentSetupButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M6 2C4.89 2 4 2.9 4 4V20C4 21.11 4.89 22 6 22H12V20H6V4H13V9H18V12H20V8L14 2M18 14C17.87 14 17.76 14.09 17.74 14.21L17.55 15.53C17.25 15.66 16.96 15.82 16.7 16L15.46 15.5C15.35 15.5 15.22 15.5 15.15 15.63L14.15 17.36C14.09 17.47 14.11 17.6 14.21 17.68L15.27 18.5C15.25 18.67 15.24 18.83 15.24 19C15.24 19.17 15.25 19.33 15.27 19.5L14.21 20.32C14.12 20.4 14.09 20.53 14.15 20.64L15.15 22.37C15.21 22.5 15.34 22.5 15.46 22.5L16.7 22C16.96 22.18 17.24 22.35 17.55 22.47L17.74 23.79C17.76 23.91 17.86 24 18 24H20C20.11 24 20.22 23.91 20.24 23.79L20.43 22.47C20.73 22.34 21 22.18 21.27 22L22.5 22.5C22.63 22.5 22.76 22.5 22.83 22.37L23.83 20.64C23.89 20.53 23.86 20.4 23.77 20.32L22.7 19.5C22.72 19.33 22.74 19.17 22.74 19C22.74 18.83 22.73 18.67 22.7 18.5L23.76 17.68C23.85 17.6 23.88 17.47 23.82 17.36L22.82 15.63C22.76 15.5 22.63 15.5 22.5 15.5L21.27 16C21 15.82 20.73 15.65 20.42 15.53L20.23 14.21C20.22 14.09 20.11 14 20 14M19 17.5C19.83 17.5 20.5 18.17 20.5 19C20.5 19.83 19.83 20.5 19 20.5C18.16 20.5 17.5 19.83 17.5 19C17.5 18.17 18.17 17.5 19 17.5Z" />
  </svg>`,
      text:
        this.language.getString('toolbar-document-setup') ?? 'document setup',
      command: 'document-setup',
    });
    createBlock.appendButton(documentSetupButton);

    const zoomInButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" />
</svg>`,
      text: this.language.getString('toolbar-zoom-in') ?? 'zoom in',
      command: 'zoomin',
    });
    zoomBlock.appendButton(zoomInButton);

    const zoomResetButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 5.5L10 8H14L12 5.5M18 10V14L20.5 12L18 10M6 10L3.5 12L6 14V10M14 16H10L12 18.5L14 16M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3M21 19H3V5H21V19Z" />
</svg>`,
      text: this.language.getString('toolbar-zoomreset') ?? 'fit',
      command: 'zoomreset',
    });
    zoomBlock.appendButton(zoomResetButton);

    const zoomOutButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" />
</svg>`,
      text: this.language.getString('toolbar-zoomout') ?? 'zoom out',
      command: 'zoomout',
    });
    zoomBlock.appendButton(zoomOutButton);

    const toolboxToggleButton = new Button({
      icon: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z" />
</svg>`,
      text:
        this.language.getString('toolbar-properties') ?? 'toggle properties',
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
    this._toolboxPanel = document.createElement('div');
    this._toolboxPanel.className = 'toolbox-panel';

    this._toolboxContainer?.appendChild(this._toolboxPanel);
  }

  private _currentToolboxPanels: PropertyPanelBase[] = [];
  private addToolboxPanel(panel: PropertyPanelBase) {
    const cb = document.createElement('div');
    cb.className = 'content-block';

    const cbTitle = document.createElement('h2');
    cbTitle.innerText = panel.title;
    cbTitle.className = 'content-block-title';
    cb.appendChild(cbTitle);

    cb.appendChild(panel.getUi());
    this._toolboxPanel.appendChild(cb);
  }
  private addToolboxPanels(panels?: PropertyPanelBase[]) {
    if (panels !== undefined) {
      //this._toolboxPanel.innerHTML = '';
      panels.forEach((p) => {
        if (this._currentToolboxPanels.indexOf(p) < 0) {
          this._currentToolboxPanels.push(p);
          this.addToolboxPanel(p)
        }
      });
    // } else if (
    //   this._currentToolboxPanels.length === 1 &&
    //   this._currentToolboxPanels[0] === this._newStencilPanel
    // ) {
    //   // already showing new stencil panel
    // } else {
    //   this._toolboxPanel.innerHTML = '';
    //   this._currentToolboxPanels = [this._newStencilPanel];
    //   this._newStencilPanel.deselectType();
    //   this.addToolboxPanel(this._newStencilPanel);
    } else {
      this._toolboxPanel.innerHTML = '';
      this._currentToolboxPanels = [];
    }
  }

  private removeToolboxPanels(panels?: PropertyPanelBase[]) {
    if (panels !== undefined) {
      let removed = false;
      panels.forEach((p) => {
        if (this._currentToolboxPanels.indexOf(p) > -1) {
          this._currentToolboxPanels.splice(this._currentToolboxPanels.indexOf(p), 1);
          removed = true;
        }
      });
      if (removed) {
        this._toolboxPanel.innerHTML = '';
        this._currentToolboxPanels.forEach(p => {
          this.addToolboxPanel(p);
        })
      }
    } else {
      this._toolboxPanel.innerHTML = '';
      this._currentToolboxPanels = [];
    }
  }

  private _isToolboxVisible = true;
  private toggleToolbox() {
    if (this._toolboxContainer !== undefined) {
      this._isToolboxVisible = !this._isToolboxVisible;
      this._toolboxContainer.style.display = this._isToolboxVisible
        ? 'flex'
        : 'none';
    }
  }

  private toolbarButtonClicked(ev: CustomEvent<ButtonEventData>) {
    if (this.mode === 'connect' && ev.detail.button.command !== 'connect') {
      this.switchConnectModeOff();
    }

    switch (ev.detail.button.command) {
      case 'add': {
        // this.showAddDialog();
        this.showAddPanel();
        break;
      }
      case 'connect': {
        this.toggleConnectMode();
        break;
      }
      case 'document-setup': {
        this.showDocumentPropertiesPanel();
        break;
      }
      case 'delete': {
        this.deleteSelected();
        break;
      }
      case 'save': {
        this.dispatchEvent(
          new CustomEvent<RenderEventData>('saveclick', {
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
      case 'undo': {
        this.undo();
        break;
      }
      case 'redo': {
        this.redo();
        break;
      }
    }
  }

  private showAddPanel() {
    if (!this._isToolboxVisible) {
      this.toggleToolbox();
    }
    this.deselectStencil();
    this.addToolboxPanels();
    this.addToolboxPanels([this._newStencilPanel]);
  }

  private toggleConnectMode() {
    if (this.mode === 'connect') {
      this.switchConnectModeOff();
    } else {
      this.switchToConnectMode();
    }
  }

  private showDocumentPropertiesPanel() {
    if (!this._isToolboxVisible) {
      this.toggleToolbox();
    }
    this.deselectStencil();

    this._documentBackgroundPanel.currentColor = this.documentBgColor;
    this._documentDimensionsPanel.currentWidth = this.documentWidth;
    this._documentDimensionsPanel.currentHeight = this.documentHeight;

    this.addToolboxPanels([
      this._documentBackgroundPanel,
      this._documentDimensionsPanel,
    ]);
  }

  private setDocumentBgColor(color: string) {
    this.documentBgColor = color;
    if (this._mainCanvas !== undefined) {
      this._mainCanvas.style.backgroundColor = color;
    }
  }

  private setDocumentSize(width: number, height: number) {
    this.documentWidth = width;
    this.documentHeight = height;
    this.setMainCanvasSize();
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
  private documentBgColor = 'white';

  private addMainCanvas() {
    this.width = this._contentContainer?.clientWidth || 0;
    this.height = this._contentContainer?.clientHeight || 0;

    this._mainCanvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    this._mainCanvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.setMainCanvasSize();
    this._mainCanvas.style.gridColumnStart = '1';
    this._mainCanvas.style.gridRowStart = '1';
    this._mainCanvas.style.pointerEvents = 'auto';
    this._mainCanvas.style.backgroundColor = this.documentBgColor;
    this._mainCanvas.style.filter = 'drop-shadow(2px 2px 8px var(--i-mjsdiae-panel-border-color))';
    this._mainCanvas.style.margin = '10px';
    //this._mainCanvas.style.transform = `scale(${this._zoomLevel})`;

    this._groupLayer = SvgHelper.createGroup();
    this._connectorLayer = SvgHelper.createGroup();
    this._objectLayer = SvgHelper.createGroup();

    this._mainCanvas.appendChild(this._groupLayer);
    this._mainCanvas.appendChild(this._connectorLayer);
    this._mainCanvas.appendChild(this._objectLayer);

    this._canvasContainer?.appendChild(this._mainCanvas);
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

      if (this._overlayContainer !== undefined) {
        this._overlayContentContainer.style.width = `${this.documentWidth}px`;
        this._overlayContentContainer.style.height = `${this.documentHeight}px`;
      }
    }
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
    this.language.addStrings('core', 'en', en_core_strings);
    this.createLayout();
    this.addToolbar();
    this.addToolbox();
    this.addMainCanvas();
    this.initOverlay();
    this.initUiLayer();
    this.attachEvents();
    this.applyStencilSet();
  }

  private disconnectedCallback() {
    this.detachEvents();
  }

  private applyStencilSet() {
    this.addToolboxPanels();
    this.setupPanels();
    this.addToolboxPanels([this._newStencilPanel]);
    if (
      this._stencilEditorSet !== undefined &&
      this._stencilEditorSet.newDocumentTemplate !== undefined
    ) {
      this.restoreState(this._stencilEditorSet.newDocumentTemplate);
    }
    if (!Activator.isLicensed('MJSDE')) {
      // NOTE:
      // before removing this call please consider supporting marker.js
      // by visiting https://markerjs.com/ for details
      // thank you!
      this.addLogo();
    } else {
      this.removeLogo();
    }
  }

  private attachEvents() {
    this._mainCanvas?.addEventListener('pointerdown', this.onCanvasPointerDown);
    this._mainCanvas?.addEventListener('pointermove', this.onCanvasPointerMove);
    this._mainCanvas?.addEventListener('pointerup', this.onCanvasPointerUp);
    this._mainCanvas?.addEventListener('pointerout', this.onCanvasPointerOut);
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

  private touchPoints = 0;
  private isDragging = false;
  private isSelecting = false;

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
      this.removeToolboxPanels();
      this.addToolboxPanels([this._newStencilPanel]);
    }
  }

  private selectHitConnector(
    target: EventTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    localCoordinates: IPoint
  ): ConnectorBaseEditor | undefined {
    const hitConnector = this.getHitConnector(target);
    if (hitConnector !== undefined) {
      this.selectConnector(hitConnector);
      this.dispatchEvent(
        new CustomEvent<ConnectorEditorEventData>('connectorclick', {
          detail: { diagramEditor: this, connectorEditor: hitConnector },
        })
      );
    } else {
      this.deselectCurrentConnector();
    }

    return hitConnector;
  }

  private selectConnector(conEditor: ConnectorBaseEditor) {
    if (this._currentConnectorEditor !== conEditor) {
      this.deselectStencil();
      this.deselectCurrentConnector();
      this._currentConnectorEditor = conEditor;
      this.popFromConnectorLayer(this._currentConnectorEditor);
      conEditor.select();
      this.removeToolboxPanels();
      this.addToolboxPanels([
        this._connectorTypePanel,
        ...this._currentConnectorEditor.propertyPanels,
      ]);
      this._connectorTypePanel.selectType(conEditor.connector.typeName);
    }
  }

  private onCanvasPointerDown(ev: PointerEvent) {
    // @todo
    // if (!this._isFocused) {
    //   this.focus();
    // }

    this._manipulationStartX = ev.clientX;
    this._manipulationStartY = ev.clientY;

    const localCoordinates = SvgHelper.clientToLocalCoordinates(
      this._mainCanvas,
      ev.clientX,
      ev.clientY,
      this.zoomLevel
    );

    this.touchPoints++;
    if (this.touchPoints === 1 || ev.pointerType !== 'touch') {
      // release capture from the original target when used with touch
      // otherwise we get the original target on pointermove/up/etc.
      if (ev.target && (<Element>ev.target).hasPointerCapture(ev.pointerId)) {
        (<Element>ev.target).releasePointerCapture(ev.pointerId);
      }
      if (
        this._currentStencilEditor !== undefined &&
        (this._currentStencilEditor.state === 'new' ||
          this._currentStencilEditor.state === 'creating')
      ) {
        // do nothing as the way new stencils are created has changed
      } else if (this.mode === 'select' && ev.target === this._mainCanvas) {
        // marquee select
        this.deselectStencil();
        this.isSelecting = true;
        this.isDragging = true;
        this._marqueeSelectRect.x = localCoordinates.x;
        this._marqueeSelectRect.y = localCoordinates.y;
        this._marqueeSelectRect.width = 0;
        this._marqueeSelectRect.height = 0;
        SvgHelper.setAttributes(this._marqueeSelectOutline, [
          ['x', localCoordinates.x.toString()],
          ['y', localCoordinates.y.toString()],
          ['width', '0'],
          ['height', '0'],
        ]);
        if (
          this._objectLayer &&
          !this._objectLayer.contains(this._marqueeSelectOutline)
        ) {
          this._objectLayer.appendChild(this._marqueeSelectOutline);
        }
      } else if (this.mode === 'select' && ev.target) {
        const hitEditor = this.selectHitEditor(ev, localCoordinates);
        if (hitEditor === undefined) {
          const hitConnector = this.selectHitConnector(
            ev.target,
            localCoordinates
          );
          hitConnector?.pointerDown(localCoordinates, ev.target);
        }
      } else if (this.mode === 'connect' && ev.target) {
        const hitEditor = this.getHitEditor(ev.target);
        if (hitEditor !== undefined) {
          this.connectionStartPort = hitEditor.getTargetPort(ev);
          if (this.connectionStartPort !== undefined) {
            this.deselectStencil();
            this.deselectCurrentConnector();
            this._currentConnectorEditor = this.addNewConnector(
              this._currentConnectorType
            );
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
            // console.log(this.connectionStartPort);
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
          SvgHelper.clientToLocalCoordinates(
            this._mainCanvas,
            ev.clientX,
            ev.clientY,
            this.zoomLevel
          ),
          ev.target
        );
      } else if (hitEditor === undefined && ev.target) {
        const localCoordinates = SvgHelper.clientToLocalCoordinates(
          this._mainCanvas,
          ev.clientX,
          ev.clientY,
          this.zoomLevel
        );
        const hitConnector = this.selectHitConnector(
          ev.target,
          localCoordinates
        );
        hitConnector?.dblClick(localCoordinates, ev.target);
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

        const localCoordinates = SvgHelper.clientToLocalCoordinates(
          this._mainCanvas,
          ev.clientX,
          ev.clientY,
          this.zoomLevel
        );
        if (this._currentStencilEditor !== undefined && this.isDragging) {
          this._currentStencilEditor.manipulate(localCoordinates);
        }
        if (this._selectedStencilEditors.length > 1 && this.isDragging) {
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
          SvgHelper.clientToLocalCoordinates(
            this._mainCanvas,
            ev.clientX,
            ev.clientY,
            this.zoomLevel
          )
        );
      }
    }
  }

  private onCanvasPointerMove(ev: PointerEvent) {
    const localPoint = SvgHelper.clientToLocalCoordinates(
      this._mainCanvas,
      ev.clientX,
      ev.clientY,
      this.zoomLevel
    );
    if (
      this._currentStencilEditor !== undefined &&
      this._currentStencilEditor.state === 'new'
    ) {
      // show new stencil outline
      if (
        this._objectLayer !== undefined &&
        !this._objectLayer.contains(this._newStencilOutline)
      ) {
        this._objectLayer.appendChild(this._newStencilOutline);
      }
      const size = this._currentStencilEditor.stencil.defaultSize;
      SvgHelper.setAttributes(this._newStencilOutline, [
        [
          'd',
          this._currentStencilEditor.stencil.getSelectorPathD(
            size.width,
            size.height
          ),
        ],
      ]);
      this._newStencilOutline.style.transform = `translate(${
        localPoint.x - size.width / 2
      }px, ${localPoint.y - size.height / 2}px)`;
    } else if (this.isDragging && this.isSelecting) {
      // adjust marquee
      const localManipulationStart = SvgHelper.clientToLocalCoordinates(
        this._mainCanvas,
        this._manipulationStartX,
        this._manipulationStartY,
        this.zoomLevel
      );

      this._marqueeSelectRect.x = Math.min(
        localPoint.x,
        localManipulationStart.x
      );
      this._marqueeSelectRect.y = Math.min(
        localPoint.y,
        localManipulationStart.y
      );
      this._marqueeSelectRect.width =
        Math.abs(ev.clientX - this._manipulationStartX) / this.zoomLevel;
      this._marqueeSelectRect.height =
        Math.abs(ev.clientY - this._manipulationStartY) / this.zoomLevel;

      SvgHelper.setAttributes(this._marqueeSelectOutline, [
        ['x', `${this._marqueeSelectRect.x}`],
        ['y', `${this._marqueeSelectRect.y}`],
        ['width', `${this._marqueeSelectRect.width}`],
        ['height', `${this._marqueeSelectRect.height}`],
      ]);
    } else {
      const hitEditor = this.getHitEditor(ev.target);
      if (this._currentHitEditor !== hitEditor) {
        // hovered editor changed
        if (hitEditor !== undefined) {
          if (!hitEditor.isSelected) {
            this.mode = 'connect';
            hitEditor.switchToConnectMode();
          }
        } else if (
          this._currentHitEditor !== undefined /*&& !this.isDragging*/
        ) {
          this.mode = 'select';
          if (this._currentHitEditor.state === 'connect') {
            this._currentHitEditor.switchConnectModeOff();
          }
        }
        this._currentHitEditor = hitEditor;
      }
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
        const targetPort = hitEditor.getTargetPort(ev, false, this.zoomLevel);
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
            // console.log(this.connectionEndPort);
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
            // console.log(targetPort);
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
    } else if (
      this._currentConnectorEditor !== undefined &&
      this._currentConnectorEditor.state === 'creating'
    ) {
      // delete new connector that isn't connecting to anything
      this.deleteConnector(this._currentConnectorEditor);
    } else if (
      this._currentConnectorEditor !== undefined &&
      this._currentConnectorEditor.state === 'move-label'
    ) {
      // moving label - @todo refactor
      this._currentConnectorEditor.pointerUp({ x: 0, y: 0 });
    } else {
      if (this.touchPoints > 0) {
        this.touchPoints--;
      }
      if (this.touchPoints === 0) {
        const localPoint = SvgHelper.clientToLocalCoordinates(
          this._mainCanvas,
          ev.clientX,
          ev.clientY,
          this.zoomLevel
        );

        if (this._currentStencilEditor !== undefined) {
          if (
            this._currentStencilEditor.state === 'new' &&
            this._objectLayer?.contains(this._newStencilOutline)
          ) {
            this._objectLayer?.removeChild(this._newStencilOutline);
            this._currentStencilEditor.create(localPoint);
          }
        }

        // deselect connector if selected and not hit
        if (
          this._currentConnectorEditor !== undefined &&
          !this.getHitConnector(ev.target)
        ) {
          this.deselectCurrentConnector();
        }

        // deselect connector if selected and not hit
        if (
          this._currentConnectorEditor !== undefined &&
          !this.getHitConnector(ev.target)
        ) {
          this.deselectCurrentConnector();
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onCanvasPointerOut(ev: PointerEvent) {
    if (
      this._objectLayer !== undefined &&
      this._objectLayer.contains(this._newStencilOutline)
    ) {
      this._objectLayer.removeChild(this._newStencilOutline);
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
      const localPoint = SvgHelper.clientToLocalCoordinates(
        this._mainCanvas,
        ev.clientX,
        ev.clientY,
        this.zoomLevel
      );

      if (this.isDragging && this.isSelecting) {
        // finish marquee selection
        if (
          this._objectLayer &&
          this._objectLayer.contains(this._marqueeSelectOutline)
        ) {
          this._objectLayer.removeChild(this._marqueeSelectOutline);
        }
        this.finishMarqueeSelection();
      } else if (
        this._currentStencilEditor !== undefined &&
        this._currentStencilEditor.state !== 'new' &&
        this.isDragging
      ) {
        this._currentStencilEditor.pointerUp(localPoint);
      }
    }
    this.isSelecting = false;
    this.isDragging = false;
    this.addUndoStep();
  }

  private onPointerOut(/*ev: PointerEvent*/) {
    if (this.touchPoints > 0) {
      this.touchPoints--;
    }
  }

  public createNewStencil(
    stencilType: typeof StencilBase | string | undefined
  ): void {
    this.deselectStencil();
    this.setCurrentStencil();
    if (stencilType !== undefined) {
      const sType =
        this._stencilEditorSet.stencilSet.getStencilProperties(stencilType);

      if (sType) {
        this.addUndoStep();
        this._currentStencilEditor = this.addNewStencil(sType.stencilType);
        this._currentStencilEditor.onStencilCreated = this.stencilCreated;
        if (this._mainCanvas) {
          this._mainCanvas.style.cursor = 'move';
        }
        // @todo
        // this.toolbar.setActiveMarkerButton(mType.typeName);
        // this.toolbox.setPanelButtons(this.currentMarker.toolboxPanels);
        // this.eventListeners['markercreating'].forEach((listener) =>
        //   listener(new MarkerEvent(this, this.currentMarker))
        // );
      }
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
    this.addUndoStep();
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
    this.addUndoStep();
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
    this.addUndoStep();
  }

  public setCurrentStencil(stencilEditor?: StencilBaseEditor): void {
    if (this._currentStencilEditor !== stencilEditor) {
      // no need to deselect if not changed
      if (this._currentStencilEditor !== undefined) {
        this._currentStencilEditor.blur();
        // @todo
        // this.toolbar.setCurrentMarker();
        // this._newStencilPanel.deselectType();
        this.addToolboxPanels();
        this.addToolboxPanels([this._newStencilPanel]);
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
    if (this._selectedStencilEditors.length === 0) {
      this.addToolboxPanels();
    }
    if (this._selectedStencilEditors.indexOf(stencilEditor) < 0) {
      this._selectedStencilEditors.push(stencilEditor);
      stencilEditor.select();
      if (this._selectedStencilEditors.length > 1) {
        this.setCurrentStencil();
      }
    } else {
      this.deselectStencil(stencilEditor);
    }
    if (this._selectedStencilEditors.length > 0) {
      this.removeToolboxPanels([this._newStencilPanel]);
      this.addToolboxPanels([this._alignPanel]);
      if (this._selectedStencilEditors.length === 1) {
        this.addToolboxPanels([this._arrangePanel]);
      } else {
        this.removeToolboxPanels([this._arrangePanel]);
      }
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

    const stencilEditor = new editor({
      iid: this.getNewIId(),
      container: g,
      overlayContainer: this._overlayContentContainer,
      settings: this.settings,
      stencilType: stencilType,
      language: this.language,
    });

    stencilEditor.container.addEventListener('pointerenter', () => {
      this.dispatchEvent(
        new CustomEvent<StencilEditorEventData>('stencilpointerenter', {
          detail: { diagramEditor: this, stencilEditor: stencilEditor },
        })
      );
    });

    stencilEditor.container.addEventListener('pointerleave', () => {
      this.dispatchEvent(
        new CustomEvent<StencilEditorEventData>('stencilpointerleave', {
          detail: { diagramEditor: this, stencilEditor: stencilEditor },
        })
      );
    });

    stencilEditor.container.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent<StencilEditorEventData>('stencilclick', {
          detail: { diagramEditor: this, stencilEditor: stencilEditor },
        })
      );
    });

    return stencilEditor;
  }

  private addNewConnector(
    connectorType: typeof ConnectorBase,
    toLayer?: SVGGElement
  ): ConnectorBaseEditor {
    const g = SvgHelper.createGroup();
    toLayer?.appendChild(g) ?? this._objectLayer?.appendChild(g);

    const connectorEditorType =
      this._stencilEditorSet.getConnectorEditor(connectorType);
    const connectorEditor = new connectorEditorType({
      iid: this.getNewIId(),
      container: g,
      overlayContainer: this._overlayContentContainer,
      settings: this.settings,
      language: this.language,
      connectorType: connectorType,
    });

    connectorEditor.container.addEventListener('pointerenter', () => {
      this.dispatchEvent(
        new CustomEvent<ConnectorEditorEventData>('connectorpointerenter', {
          detail: { diagramEditor: this, connectorEditor: connectorEditor },
        })
      );
    });

    connectorEditor.container.addEventListener('pointerleave', () => {
      this.dispatchEvent(
        new CustomEvent<ConnectorEditorEventData>('connectorpointerleave', {
          detail: { diagramEditor: this, connectorEditor: connectorEditor },
        })
      );
    });

    connectorEditor.container.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent<ConnectorEditorEventData>('connectorclick', {
          detail: { diagramEditor: this, connectorEditor: connectorEditor },
        })
      );
    });

    return connectorEditor;
  }

  private changeConnectorType(newType: typeof ConnectorBase) {
    if (
      this._currentConnectorEditor !== undefined &&
      this._currentConnectorEditor.connector.typeName !== newType.typeName
    ) {
      const conState = this._currentConnectorEditor.connector.getState();
      conState.typeName = newType.typeName;
      this.deleteConnector(this._currentConnectorEditor);
      const conEditor = this.restoreConnector(conState);
      if (conEditor) {
        this.selectConnector(conEditor);
      }
    }
  }

  private finishMarqueeSelection() {
    this.deselectStencil();
    this._stencilEditors.forEach((se) => {
      if (
        se.stencil.left >= this._marqueeSelectRect.x &&
        se.stencil.top >= this._marqueeSelectRect.y &&
        se.stencil.right <= this._marqueeSelectRect.right &&
        se.stencil.bottom <= this._marqueeSelectRect.bottom
      )
        this.selectStencil(se);
    });

    if (this._selectedStencilEditors.length === 1) {
      this.setCurrentStencil(this._selectedStencilEditors[0]);
      if (this._currentStencilEditor !== undefined) {
        this._currentStencilEditor.focus();
      }
    }
  }

  addEventListener<T extends keyof DiagramEditorEventMap>(
    // the event name, a key of DiagramEditorEventMap
    type: T,

    // the listener, using a value of DiagramEditorEventMap
    listener: (this: DiagramEditor, ev: DiagramEditorEventMap[T]) => void,

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
      width: this.documentWidth,
      height: this.documentHeight,

      backgroundColor: this.documentBgColor,

      stencils: [],
      connectors: [],
    };

    this._stencilEditors.forEach((se) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result.stencils!.push(se.stencil.getState())
    );
    this._connectorEditors.forEach((ce) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result.connectors!.push(ce.connector.getState())
    );

    return result;
  }

  private restoreConnector(
    conState: ConnectorBaseState
  ): ConnectorBaseEditor | undefined {
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
        const endPort = endStencil.stencil.ports.get(conState.endPortLocation);

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

          return conEditor;
        }
      }
    }
  }

  public restoreState(state: DiagramState): void {
    if (state.width !== undefined && state.height !== undefined) {
      this.setDocumentSize(state.width, state.height);
    }

    if (state.backgroundColor !== undefined) {
      this.setDocumentBgColor(state.backgroundColor);
    }

    this._stencilEditors.splice(0);
    while (this._objectLayer?.lastChild) {
      this._objectLayer.removeChild(this._objectLayer.lastChild);
    }
    this._connectorEditors.splice(0);
    while (this._connectorLayer?.lastChild) {
      this._connectorLayer.removeChild(this._connectorLayer.lastChild);
    }
    this._iid = 0;

    if (state.stencils !== undefined && state.stencils.length > 0) {
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
    }

    if (state.connectors !== undefined && state.connectors.length > 0) {
      state.connectors.forEach((conState) => {
        this.restoreConnector(conState);
      });
    }

    this.dispatchEvent(
      new CustomEvent<DiagramEditorEventData>('diagramload', {
        detail: { editor: this },
      })
    );
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

  /**
   * Returns true if undo operation can be performed (undo stack is not empty).
   */
  public get isUndoPossible(): boolean {
    if (this.undoRedoManager && this.undoRedoManager.isUndoPossible) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns true if redo operation can be performed (redo stack is not empty).
   */
  public get isRedoPossible(): boolean {
    if (this.undoRedoManager && this.undoRedoManager.isRedoPossible) {
      return true;
    } else {
      return false;
    }
  }

  private addUndoStep() {
    if (
      this._currentStencilEditor === undefined ||
      this._currentStencilEditor.state !== 'edit'
    ) {
      const currentState = this.getState();
      const lastUndoState = this.undoRedoManager.getLastUndoStep();
      if (
        lastUndoState &&
        (lastUndoState.width !== currentState.width ||
          lastUndoState.height !== currentState.height)
      ) {
        // if the size changed just replace the last step with a resized one
        this.undoRedoManager.replaceLastUndoStep(currentState);
        this.dispatchEvent(
          new CustomEvent<DiagramEditorEventData>('statechange', {
            detail: { editor: this },
          })
        );
      } else {
        const stepAdded = this.undoRedoManager.addUndoStep(currentState);
        if (stepAdded) {
          this.dispatchEvent(
            new CustomEvent<DiagramEditorEventData>('statechange', {
              detail: { editor: this },
            })
          );
        }
      }
    }
  }

  /**
   * Undo last action.
   */
  public undo(): void {
    this.addUndoStep();
    this.undoStep();
  }

  private undoStep(): void {
    const stepData = this.undoRedoManager.undo();
    if (stepData !== undefined) {
      this.restoreState(stepData);
    }
  }

  /**
   * Redo previously undone action.
   */
  public redo(): void {
    this.redoStep();
  }

  private redoStep(): void {
    const stepData = this.undoRedoManager.redo();
    if (stepData !== undefined) {
      this.restoreState(stepData);
      this.dispatchEvent(
        new CustomEvent<DiagramEditorEventData>('statechange', {
          detail: { editor: this },
        })
      );
    }
  }

  /**
   * NOTE:
   *
   * before removing or modifying this method please consider supporting marker.js
   * by visiting https://markerjs.com/buy for details
   *
   * thank you!
   */
  private addLogo() {
    if (this._logoUI !== undefined) {
      this._contentContainer?.removeChild(this._logoUI);
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

    this._contentContainer?.appendChild(this._logoUI);

    this._logoUI.style.position = 'absolute';
    this._logoUI.style.pointerEvents = 'all';
    this.positionLogo();
  }

  private removeLogo() {
    if (this._logoUI !== undefined) {
      this._contentContainer?.removeChild(this._logoUI);
    }
  }

  private positionLogo() {
    if (this._logoUI && this._contentContainer) {
      this._logoUI.style.left = `20px`;
      this._logoUI.style.top = `${
        this._contentContainer.offsetHeight - this._logoUI.clientHeight - 20
      }px`;
    }
  }

  private readonly PAGE_MARGIN = 10;
  private alignHorizontally(alignment: HorizontalAlignment) {
    if (this._selectedStencilEditors.length > 0) {
      if (this._selectedStencilEditors.length > 1) {
        switch(alignment) {
          case 'left': {
            const x = this._selectedStencilEditors[0].stencil.left;
            for (let i = 1; i < this._selectedStencilEditors.length; i++) {
              this._selectedStencilEditors[i].moveStencilTo(x);  
            }
            break;
          }
          case 'center': {
            const centerX = this._selectedStencilEditors[0].stencil.left + this._selectedStencilEditors[0].stencil.width / 2;
            for (let i = 1; i < this._selectedStencilEditors.length; i++) {
              const x = centerX - this._selectedStencilEditors[i].stencil.width / 2;
              this._selectedStencilEditors[i].moveStencilTo(x);  
            }
            break;
          }
          case 'right': {
            const rightX = this._selectedStencilEditors[0].stencil.left + this._selectedStencilEditors[0].stencil.width;
            for (let i = 1; i < this._selectedStencilEditors.length; i++) {
              const x = rightX - this._selectedStencilEditors[i].stencil.width;
              this._selectedStencilEditors[i].moveStencilTo(x);  
            }
            break;
          }
        }
      } else {
        switch(alignment) {
          case 'left': {
            this._selectedStencilEditors[0].moveStencilTo(this.PAGE_MARGIN);
            break;
          }
          case 'center': {
            const x = this.documentWidth / 2 - this._selectedStencilEditors[0].stencil.width / 2;
            this._selectedStencilEditors[0].moveStencilTo(x);
            break;
          }
          case 'right': {
            const x = this.documentWidth - this.PAGE_MARGIN - this._selectedStencilEditors[0].stencil.width;
            this._selectedStencilEditors[0].moveStencilTo(x);
            break;
          }
        }
      }
    }
  }
  private alignVertically(alignment: VerticalAlignment) {
    if (this._selectedStencilEditors.length > 0) {
      if (this._selectedStencilEditors.length > 1) {
        switch(alignment) {
          case 'top': {
            const y = this._selectedStencilEditors[0].stencil.top;
            for (let i = 1; i < this._selectedStencilEditors.length; i++) {
              this._selectedStencilEditors[i].moveStencilTo(undefined, y);
            }
            break;
          }
          case 'middle': {
            const middleX = this._selectedStencilEditors[0].stencil.top + this._selectedStencilEditors[0].stencil.height / 2;
            for (let i = 1; i < this._selectedStencilEditors.length; i++) {
              const y = middleX - this._selectedStencilEditors[i].stencil.height / 2;
              this._selectedStencilEditors[i].moveStencilTo(undefined, y);  
            }
            break;
          }
          case 'bottom': {
            const bottomY = this._selectedStencilEditors[0].stencil.top + this._selectedStencilEditors[0].stencil.height;
            for (let i = 1; i < this._selectedStencilEditors.length; i++) {
              const y = bottomY - this._selectedStencilEditors[i].stencil.height;
              this._selectedStencilEditors[i].moveStencilTo(undefined, y);  
            }
            break;
          }
        }
      } else {
        switch(alignment) {
          case 'top': {
            this._selectedStencilEditors[0].moveStencilTo(undefined, this.PAGE_MARGIN);
            break;
          }
          case 'middle': {
            const y = this.documentHeight / 2 - this._selectedStencilEditors[0].stencil.height / 2;
            this._selectedStencilEditors[0].moveStencilTo(undefined, y);
            break;
          }
          case 'bottom': {
            const y = this.documentHeight - this.PAGE_MARGIN - this._selectedStencilEditors[0].stencil.height;
            this._selectedStencilEditors[0].moveStencilTo(undefined, y);
            break;
          }
        }
      }
    }
  }

  private arrange(arrangement: ArrangementType) {
    if (this._objectLayer !== undefined && this._currentStencilEditor !== undefined) {
      const currentStencilIndex = this._stencilEditors.indexOf(this._currentStencilEditor);
      let currentContainerIndex = -1;
      const currentContainer = this._currentStencilEditor.container;
      for (let i = 0; i < this._objectLayer.children.length; i++) {
        if (this._objectLayer.children[i] === currentContainer) {
          currentContainerIndex = i;
          break;
        }
      }

      if (currentStencilIndex > -1 && currentContainerIndex > -1) {
        switch(arrangement) {
          case 'front': {
            if (currentStencilIndex < (this._stencilEditors.length - 1)) {
              this._stencilEditors.splice(currentStencilIndex, 1);
              this._stencilEditors.push(this._currentStencilEditor);
            }
            if (currentContainerIndex < (this._objectLayer.children.length - 1)) {
              this._objectLayer.removeChild(currentContainer);
              this._objectLayer.appendChild(currentContainer);
            }
            break;
          }
          case 'forward': {
            if (currentStencilIndex < (this._stencilEditors.length - 1)) {
              this._stencilEditors.splice(currentStencilIndex, 1);
              if (currentStencilIndex < (this._stencilEditors.length - 1)) {
                this._stencilEditors.splice(currentStencilIndex + 1, 0, this._currentStencilEditor);
              } else {
                this._stencilEditors.push(this._currentStencilEditor);
              }
            }
            if (currentContainerIndex < (this._objectLayer.children.length - 1)) {
              this._objectLayer.removeChild(currentContainer);
              if (currentContainerIndex < (this._objectLayer.children.length - 1)) {
                this._objectLayer.insertBefore(currentContainer, this._objectLayer.children[currentContainerIndex + 1]);
              } else {
                this._objectLayer.appendChild(currentContainer);
              }
            }
            break;
          }
          case 'backward': {
            if (currentStencilIndex > 0) {
              this._stencilEditors.splice(currentStencilIndex, 1);
              this._stencilEditors.splice(currentStencilIndex - 1, 0, this._currentStencilEditor);
            }
            if (currentContainerIndex > 0) {
              this._objectLayer.removeChild(currentContainer);
              this._objectLayer.insertBefore(currentContainer, this._objectLayer.children[currentContainerIndex - 1]);
            }
            break;
          }
          case 'back': {
            if (currentStencilIndex > 0) {
              this._stencilEditors.splice(currentStencilIndex, 1);
              this._stencilEditors.splice(0, 0, this._currentStencilEditor);
            }
            if (currentContainerIndex > 0) {
              this._objectLayer.removeChild(currentContainer);
              this._objectLayer.insertBefore(currentContainer, this._objectLayer.firstChild);
            }
            break;
          }
        }
      }

    }
  }
}
