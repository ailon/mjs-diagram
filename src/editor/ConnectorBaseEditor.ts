import { ConnectorBase } from '../core';
import { IPoint } from '../core';
import { SvgHelper } from '../core';
import { Port } from '../core';
import {
  ConnectorBaseState,
  ConnectorEndPoints,
} from '../core';

import { ResizeGrip } from './ResizeGrip';
import { PropertyPanelBase } from './panels/PropertyPanelBase';
import { ColorPickerPanel } from './panels/ColorPickerPanel';
import { ArrowTypePanel } from './panels/ArrowTypePanel';
import { TextBlockEditor } from './TextBlockEditor';
import { EditorSettings } from './EditorSettings';
import { ConnectorEditorProperties } from './ConnectorEditorProperties';
import { Language } from './Language';
import { LineStylePanel } from './panels/LineStylePanel';

/**
 * Represents the state of the connector editor.
 */
export type ConnectorState =
  | 'new'
  | 'creating'
  | 'select'
  | 'move'
  | 'edit'
  | 'move-label';

/**
 * ConnectorBaseEditor covers basic connector creating and editing features.
 * It is used to edit most of the common connector types that don't require 
 * some special editor treatment.
 */
export class ConnectorBaseEditor {
  /**
   * Current state of the connector editor.
   */
  protected _state: ConnectorState = 'new';
  /**
   * Returns current state of the connector editor.
   */
  public get state(): ConnectorState {
    return this._state;
  }
  
  /**
   * Fired when the connector creation is completed.
   * @group Events
   */  
  public onConnectorCreated?: (connector: ConnectorBaseEditor) => void;

  /**
   * Fired when the connector is changed (moved, edited, etc.).
   * @group Events
   */  
  public onConnectorUpdated?: (connector: ConnectorBaseEditor) => void;

  /**
   * Initial X coordinate where pointer manipulation has started.
   */
  protected manipulationStartX = 0;
  /**
   * Initial Y coordinate where pointer manipulation has started.
   */
  protected manipulationStartY = 0;
  /**
   * Pointer's X coordinate after the previous pointer event.
   */
  protected prevX = 0;
  /**
   * Pointer's Y coordinate after the previous pointer event.
   */
  protected prevY = 0;

  private manipulationStartX1 = 0;
  private manipulationStartY1 = 0;
  private manipulationStartX2 = 0;
  private manipulationStartY2 = 0;

  private isDraggingLabel = false;

  private textBlockEditor: TextBlockEditor;

  /**
   * Container for control elements.
   */
  protected controlBox!: SVGGElement;

  /**
   * First manipulation grip
   */
  protected grip1!: ResizeGrip;
  /**
   * Second manipulation grip.
   */
  protected grip2!: ResizeGrip;
  /**
   * Active manipulation grip.
   */
  protected activeGrip?: ResizeGrip;

  /**
   * Connector being edited by this connector editor.
   */
  public connector: ConnectorBase;
  /**
   * Reference to the port being moved.
   */
  public movingPort?: Port;

  /**
   * SVG group container encapsulating all the connector's elements.
   */
  protected _container: SVGGElement;
  /**
   * Returns the SVG group container for the connector's elements.
   */
  public get container(): SVGGElement {
    return this._container;
  }

  /**
   * HTML overlay container for editor elements like text editor, etc.
   */
  protected overlayContainer: HTMLDivElement;

  private strokePanel: ColorPickerPanel;
  private arrowTypePanel: ArrowTypePanel;
  private lineStylePanel: LineStylePanel;
  private lineWidthPanel: LineStylePanel;


  private _settings: EditorSettings;
  /**
   * Returns editor settings.
   */
  protected get settings(): EditorSettings {
    return this._settings;
  }

  /**
   * Language (localization) subsystem instance.
   */
  protected _language: Language;

  /**
   * Creates a new instance of the connector editor.
   * @param properties connector editor properties.
   */
  constructor(properties: ConnectorEditorProperties) {
    this.connector =
      properties.connector ??
      new properties.connectorType(properties.iid, properties.container, properties.settings);
    this._container = properties.container;
    this.overlayContainer = properties.overlayContainer;
    this._settings = properties.settings;
    this._language = properties.language;
    this.connector.textBlock.fontFamily = this.settings.getFontFamily(this.connector.typeName);

    this.connector.strokeColor = this.settings.getColor(
      this.connector.typeName,
      'stroke'
    );

    this.textBlockEditor = new TextBlockEditor();

    this.strokePanel = new ColorPickerPanel(
      this._language.getString('toolbox-linecolor-title') ?? 'Line color',
      this._language,
      this.settings.getColorSet(this.connector.typeName, 'stroke'),
      this.connector.strokeColor
    );
    this.strokePanel.onColorChanged = this.connector.setStrokeColor;

    this.arrowTypePanel = new ArrowTypePanel(
      this._language.getString('toolbox-arrowtype-title') ?? 'Arrow type',
      this._language,
      this.connector.arrowType
    );
    this.arrowTypePanel.onArrowTypeChanged = this.connector.setArrowType;

    this.lineStylePanel = new LineStylePanel(
      this._language.getString('toolbox-linestyle-title') ?? 'Line style',
      this._language,
      'stroke-dasharray',
      this.settings.getDashArrays(this.connector.typeName),
      this.connector.strokeDasharray
    );
    this.lineStylePanel.lineAttributes = [['stroke-width', '3']];
    this.lineStylePanel.onLineStyleChanged = this.connector.setStrokeDasharray;

    this.lineWidthPanel = new LineStylePanel(
      this._language.getString('toolbox-linestyle-title') ?? 'Line width',
      this._language,
      'stroke-width',
      this.settings.getStrokeWidths(this.connector.typeName),
      this.connector.strokeWidth.toString()
    );
    this.lineWidthPanel.onLineStyleChanged = this.connector.setStrokeWidth;    

    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);
    this.setupControlBox = this.setupControlBox.bind(this);
    this.adjustControlBox = this.adjustControlBox.bind(this);
    this.showControlBox = this.showControlBox.bind(this);
    this.hideControlBox = this.hideControlBox.bind(this);
    this.restoreState = this.restoreState.bind(this);

    this.pointerDown = this.pointerDown.bind(this);
    this.pointerUp = this.pointerUp.bind(this);
    this.manipulate = this.manipulate.bind(this);

    this.showTextEditor = this.showTextEditor.bind(this);
    this.positionTextEditor = this.positionTextEditor.bind(this);
    this.textChanged = this.textChanged.bind(this);
  }

  /**
   * Returns true if the supplied element (event target) belongs to this connector
   * or connector editor.
   * @param el target element.
   * @returns true if the element belongs to the connector or editor.
   */
  public ownsTarget(el: EventTarget | null): boolean {
    let found = false;
    if (el !== null) {
      if (
        this.grip1.ownsTarget(el) ||
        this.grip2.ownsTarget(el) ||
        this.connector.ownsTarget(el)
      ) {
        found = true;
      } else {
        found = false;
      }
    }
    return found;
  }

  /**
   * Is connector selected?
   */
  protected _isSelected = false;
  /**
   * Returns true if the connector is currently selected.
   */
  public get isSelected(): boolean {
    return this._isSelected;
  }

  /**
   * Selects the connector.
   */
  public select(): void {
    this.connector.container.style.cursor = 'move';
    this._isSelected = true;
    if (this.controlBox === undefined) {
      this.setupControlBox();
    }
    this.adjustControlBox();
    this.showControlBox();
  }

  /**
   * Deselects the connector.
   */
  public deselect(): void {
    this.connector.container.style.cursor = 'default';
    this._isSelected = false;
    this.hideControlBox();
  }

  /**
   * Hides the connector editor controls.
   */
  protected hideControlBox(): void {
    this.controlBox.style.display = 'none';
    this.connector.textBlock.hideControlBox();
  }

  /**
   * Shows the connector editor controls.
   */
  protected showControlBox(): void {
    if (this.controlBox === undefined) {
      this.setupControlBox();
    }
    this.controlBox.style.display = '';
    this.connector.textBlock.showControlBox();
  }

  /**
   * Handles `pointerdown` event on the connector editor.
   * @param point pointer location.
   * @param target immediate pointer event target.
   */
  public pointerDown(point: IPoint, target?: EventTarget): void {
    this.manipulationStartX = point.x;
    this.manipulationStartY = point.y;
    this.prevX = point.x;
    this.prevY = point.y;

    if (this.state === 'new') {
      this.connector.createVisual();
      this.connector.x1 = point.x;
      this.connector.y1 = point.y;
      this.connector.x2 = point.x;
      this.connector.y2 = point.y;
    }

    this.manipulationStartX1 = this.connector.x1;
    this.manipulationStartY1 = this.connector.y1;
    this.manipulationStartX2 = this.connector.x2;
    this.manipulationStartY2 = this.connector.y2;

    if (this.state !== 'new') {
      this.select();
      if (target && this.grip1.ownsTarget(target)) {
        this.activeGrip = this.grip1;
        this.movingPort = this.connector.startPort;
      } else if (target && this.grip2.ownsTarget(target)) {
        this.activeGrip = this.grip2;
        this.movingPort = this.connector.endPort;
      } else if (target && this.connector.textBlock.ownsTarget(target)) {
        this.isDraggingLabel = true;
      } else {
        this.activeGrip = undefined;
        this.movingPort = undefined;
        this.isDraggingLabel = false;
      }

      if (this.activeGrip) {
        this._state = 'move';
        SvgHelper.setAttributes(this.connector.container, [
          ['pointer-events', 'none'],
        ]);
      } else if (this.isDraggingLabel) {
        this._state = 'move-label';
      } else {
        this._state = 'select';
      }
    } else {
      this.connector.adjustVisual();
      this.showControlBox();

      this._state = 'creating';
      SvgHelper.setAttributes(this.connector.container, [
        ['pointer-events', 'none'],
      ]);
    }
  }

  /**
   * Handles double-click event on the connector - opens the text editor for the label.
   * @param point pointer location.
   * @param target immediate event target.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public dblClick(point: IPoint, target?: EventTarget): void {
    this.showTextEditor();
  }

  /**
   * Handles pointer manipulation depending on the editor's state (movement, resizing, etc.)
   * @param point pointer location.
   */
  public manipulate(point: IPoint): void {
    if (this.state === 'creating') {
      this.resize(point);
    } else if (this.state === 'move') {
      if (this.activeGrip === this.grip1) {
        this.connector.setStartPosition({
          x: this.manipulationStartX1 + point.x - this.manipulationStartX,
          y: this.manipulationStartY1 + point.y - this.manipulationStartY,
        });
      } else if (this.activeGrip === this.grip2) {
        this.connector.setEndPosition({
          x: this.manipulationStartX2 + point.x - this.manipulationStartX,
          y: this.manipulationStartY2 + point.y - this.manipulationStartY,
        });
      }
    } else if (this.isDraggingLabel) {
      if (point.x !== 0 || point.y !== 0) {
        // not resetting
        this.connector.moveLabel(point.x - this.prevX, point.y - this.prevY);
      }
    }
    this.adjustControlBox();

    this.prevX = point.x;
    this.prevY = point.y;
  }

  /**
   * Resizes the connector.
   * @param point pointer location.
   */
  protected resize(point: IPoint): void {
    switch (this.activeGrip) {
      case this.grip1:
        this.connector.setStartPosition({ x: point.x, y: point.y });
        break;
      case this.grip2:
      case undefined:
        this.connector.setEndPosition({ x: point.x, y: point.y });
        break;
    }
    this.adjustControlBox();
  }

  /**
   * Creates the control box for the editor.
   */
  protected setupControlBox(): void {
    this.controlBox = SvgHelper.createGroup();

    this.controlBox.classList.add('control-box');

    this.connector.container.appendChild(this.controlBox);

    this.addControlGrips();

    this.controlBox.style.display = 'none';
  }

  private adjustControlBox() {
    if (this.controlBox === undefined) {
      this.setupControlBox();
    }
    this.positionGrips();
  }

  /**
   * Adds control grips to the editor.
   */
  protected addControlGrips(): void {
    this.grip1 = this.createGrip();
    this.grip2 = this.createGrip();

    this.positionGrips();
  }

  /**
   * Creates a control grip (for resizing).
   * @returns created grip.
   */
  protected createGrip(): ResizeGrip {
    const grip = new ResizeGrip();
    grip.visual.transform.baseVal.appendItem(SvgHelper.createTransform());
    this.controlBox.appendChild(grip.visual);

    return grip;
  }

  /**
   * Positions control grips according to the connector's position.
   */
  protected positionGrips(): void {
    const gripSize = this.grip1.GRIP_SIZE;

    this.positionGrip(
      this.grip1.visual,
      this.connector.x1 - gripSize / 2,
      this.connector.y1 - gripSize / 2
    );
    this.positionGrip(
      this.grip2.visual,
      this.connector.x2 - gripSize / 2,
      this.connector.y2 - gripSize / 2
    );
  }

  /**
   * Positions a control grip at specified location.
   * @param grip grip to position.
   * @param x horizontal coordinate.
   * @param y vertical coordinate.
   */
  protected positionGrip(grip: SVGGraphicsElement, x: number, y: number): void {
    const translate = grip.transform.baseVal.getItem(0);
    translate.setTranslate(x, y);
    grip.transform.baseVal.replaceItem(translate, 0);
  }

  /**
   * Handles the `pointerup` event.
   * @param point pointer location.
   */
  public pointerUp(point: IPoint): void {
    const inState = this.state;
    this.manipulate(point);
    this._state = 'select';
    if (inState === 'creating') {
      this.deselect();
      if (this.onConnectorCreated) {
        this.onConnectorCreated(this);
      }
    } else if (inState === 'move') {
      this.deselect();
      this.connector.adjustPoints();
      this.connector.adjustVisual();
      if (this.onConnectorUpdated) {
        this.onConnectorUpdated(this);
      }
      this.activeGrip = undefined;
    } else if (this.isDraggingLabel) {
      this.connector.adjustPoints();
      this.connector.adjustVisual();
      this.isDraggingLabel = false;
    }

    SvgHelper.setAttributes(this.connector.container, [
      ['pointer-events', 'auto'],
    ]);
  }

  private showTextEditor() {
    this._state = 'edit';
    this.overlayContainer.innerHTML = '';

    this.textBlockEditor.text = this.connector.labelText;

    this.positionTextEditor();

    this.textBlockEditor.onTextChanged = this.textChanged;

    this.overlayContainer.appendChild(this.textBlockEditor.getEditorUi());

    // this.hideVisual();

    this.textBlockEditor.focus();

    document.execCommand('selectAll');
  }

  private positionTextEditor() {
    if (this.state === 'edit') {
      this.textBlockEditor.width = 100;
      this.textBlockEditor.height = 50;
      this.textBlockEditor.left =
        this.connector.textBoundingBox.x +
        this.connector.textBlock.offsetX +
        this.connector.textBoundingBox.width / 2 -
        this.textBlockEditor.width / 2;
      this.textBlockEditor.top =
        this.connector.textBoundingBox.y +
        this.connector.textBlock.offsetY +
        this.connector.textBoundingBox.height / 2 -
        this.textBlockEditor.height / 2;

      this.connector.textBlock.hide();
    }
  }

  private textChanged(text: string) {
    this.connector.labelText = text.trim();
    this.overlayContainer.innerHTML = '';
    this.connector.textBlock.show();
    // this.connector.renderText();
    // this.connector.positionText();
    // this.showVisual();
    // if (this._suppressStencilCreateEvent) {
    //   this._suppressStencilCreateEvent = false;
    //   if (this.onStencilCreated) {
    //     this.onStencilCreated(this);
    //   }
    // }
  }

  /**
   * Returns diagram editor property panels for the connector.
   */
  public get propertyPanels(): PropertyPanelBase[] {
    return [this.arrowTypePanel, this.strokePanel, this.lineWidthPanel, this.lineStylePanel];
  }

  /**
   * Disposes of the editor.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public dispose(): void {}

  /**
   * Scales the connector and editor.
   * @param scaleX horizontal scale factor.
   * @param scaleY vertical scale factor.
   */
  public scale(scaleX: number, scaleY: number): void {
    this.connector.scale(scaleX, scaleY);
    this.adjustControlBox();
  }

  /**
   * Restores the connector's state and adjusts the editor accordingly.
   * @param state connector's state.
   * @param endPoints connector's end points.
   */
  public restoreState(
    state: ConnectorBaseState,
    endPoints: ConnectorEndPoints
  ): void {
    this.connector.restoreState(state, endPoints);
    this.adjustControlBox();
    this._state = 'select';
  }
}
