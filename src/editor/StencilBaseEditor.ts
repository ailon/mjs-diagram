import { IPoint } from '../core';
import { PortLocation } from '../core';
import { StencilBase } from '../core';
import { StencilBaseState } from '../core';
import { SvgHelper } from '../core';

import { PortConnector } from './PortConnector';
import { PropertyPanelBase } from './panels/PropertyPanelBase';
import { GripLocation, ResizeGrip } from './ResizeGrip';
import { EditorSettings } from './EditorSettings';
import { StencilEditorProperties } from './StencilEditorProperties';
import { ShapePropertiesPanel } from './panels/ShapePropertiesPanel';
import { Language } from './Language';

/**
 * The state of the stencil editor.
 */
export type StencilEditorState =
  | 'new'
  | 'creating'
  | 'select'
  | 'focus'
  | 'move'
  | 'resize'
  | 'edit'
  | 'connect';

/**
 * The core stencil editor class for most stencil types.
 */
export class StencilBaseEditor {
  // @todo switch type to use the generic
  /**
   * Type of the edited stencil.
   */
  protected _stencilType: typeof StencilBase;
  /**
   * Stencil being edited.
   */
  protected _stencil: StencilBase;
  /**
   * Returns the stencil being edited.
   */
  public get stencil(): StencilBase {
    return this._stencil;
  }

  /**
   * SVG container for the stencil's and editor's visual elements.
   */
  protected _container: SVGGElement;
  /**
   * Returns the SVG container for the stencil's and editor's visual elements.
   */
  public get container(): SVGGElement {
    return this._container;
  }

  /**
   * Overlay container for HTML elements like text editors, etc.
   */
  protected _overlayContainer: HTMLDivElement;
  /**
   * Overlay container for HTML elements like text editors, etc.
   */
  public get overlayContainer(): HTMLDivElement {
    return this._overlayContainer;
  }

  /**
   * Editor's state.
   */
  protected _state: StencilEditorState = 'new';
  /**
   * Gets editor's state.
   */
  public get state(): StencilEditorState {
    return this._state;
  }
  /**
   * Sets editor's state.
   */
  public set state(value: StencilEditorState) {
    this._state = value;
  }

  private _settings: EditorSettings;
  /**
   * Editor settings and contextual settings manager.
   */
  protected get settings(): EditorSettings {
    return this._settings;
  }

  /**
   * Resize grips.
   */
  protected resizeGrips = new Map<GripLocation, ResizeGrip>([
    ['topleft', new ResizeGrip()],
    ['topcenter', new ResizeGrip()],
    ['topright', new ResizeGrip()],
    ['leftcenter', new ResizeGrip()],
    ['rightcenter', new ResizeGrip()],
    ['bottomleft', new ResizeGrip()],
    ['bottomcenter', new ResizeGrip()],
    ['bottomright', new ResizeGrip()],
  ]);
  /**
   * Currently active grip.
   */
  protected activeGrip?: ResizeGrip;

  /**
   * Collection of ports.
   */
  protected portConnectors = new Map<PortLocation, PortConnector>();

  /**
   * SVG group holding editor's control box.
   */
  protected _controlBox = SvgHelper.createGroup();
  /**
   * SVG group holding resize grips.
   */
  protected _gripBox = SvgHelper.createGroup();
  private readonly CB_DISTANCE: number = 10;
  private _controlRect?: SVGRectElement;

  /**
   * SVG group for holding connector ports.
   */
  protected _portBox = SvgHelper.createGroup();
  /**
   * Outline displayed in "connect" mode.
   */
  protected _connectorOutline?: SVGPathElement;

  // private strokePanel: ColorPickerPanel;
  // private fillPanel: ColorPickerPanel;
  private shapePanel: ShapePropertiesPanel;

  /**
   * Language (localization) subsystem.
   */
  protected _language: Language;

  /**
   * Creates a new stencil editor.
   * @param properties stencil editor properties.
   */
  constructor(properties: StencilEditorProperties) {
    this._container = properties.container;
    this._overlayContainer = properties.overlayContainer;
    this._stencilType = properties.stencilType;
    this._settings = properties.settings;
    this._language = properties.language;
    this._stencil =
      properties.stencil ??
      new properties.stencilType(
        properties.iid,
        properties.container,
        this.settings
      );

    this.shapePanel = new ShapePropertiesPanel(
      this._language.getString('toolbox-shape-title') ?? 'Shape',
      this._language,
      {
        strokeColors: this.settings.getColorSet(
          this.stencil.typeName,
          'stroke'
        ),
        strokeColor: this.settings.getColor(this.stencil.typeName, 'stroke'),
        fillColors: this.settings.getColorSet(this.stencil.typeName, 'fill'),
        fillColor: this.settings.getColor(this.stencil.typeName, 'fill'),
        lineStyles: this.settings.getDashArrays(this.stencil.typeName),
        lineStyle: this.settings.getDashArray(this.stencil.typeName),
        lineWidths: this.settings.getStrokeWidths(this.stencil.typeName),
        lineWidth: this.settings.getStrokeWidth(this.stencil.typeName),
      }
    );
    this.shapePanel.fillPanelsEnabled = this.stencil.fillEditable;
    this.shapePanel.strokePanelsEnabled = this.stencil.strokeEditable;
    
    this.shapePanel.onStrokeColorChanged = this._stencil.setStrokeColor;
    this.shapePanel.onFillColorChanged = this._stencil.setFillColor;
    this.shapePanel.onLineStyleChanged = this._stencil.setStrokeDasharray;
    this.shapePanel.onLineWidthChanged = this._stencil.setStrokeWidth;

    this.findGripByVisual = this.findGripByVisual.bind(this);
    this.ownsTarget = this.ownsTarget.bind(this);

    this.switchToConnectMode = this.switchToConnectMode.bind(this);
    this.switchConnectModeOff = this.switchConnectModeOff.bind(this);

    this.setupVisuals = this.setupVisuals.bind(this);
    this.setupControlBox = this.setupControlBox.bind(this);
    this.setupPortBox = this.setupPortBox.bind(this);
    this.addResizeGrips = this.addResizeGrips.bind(this);
    this.addPorts = this.addPorts.bind(this);
    this.positionGrips = this.positionGrips.bind(this);
    this.positionPorts = this.positionPorts.bind(this);
    this.positionGrip = this.positionGrip.bind(this);
    this.hideControlBox = this.hideControlBox.bind(this);
    this.showControlBox = this.showControlBox.bind(this);
    this.hidePortBox = this.hidePortBox.bind(this);
    this.showPortBox = this.showPortBox.bind(this);
    this.adjustControlBox = this.adjustControlBox.bind(this);
    this.adjustPortBox = this.adjustPortBox.bind(this);

    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);

    this.initManipulation = this.initManipulation.bind(this);
    this.create = this.create.bind(this);

    this.moveStencilTo = this.moveStencilTo.bind(this);
  }

  /**
   * Returns true if the element belongs to the stencil or the editor.
   * @param el target element.
   * @returns true if the element belongs to the stencil or editor.
   */
  public ownsTarget(el: EventTarget | null): boolean {
    let found = false;
    if (el !== null) {
      if (this._stencil?.ownsTarget(el)) {
        return true;
      } else {
        this.resizeGrips.forEach((grip) => {
          if (grip.ownsTarget(el)) {
            found = true;
          }
        });
        if (!found) {
          this.portConnectors.forEach((port) => {
            if (port.ownsTarget(el)) {
              found = true;
            }
          });
        }
      }
    }
    return found;
  }

  /**
   * Returns a port under the current pointer.
   * @param ev pointer event.
   * @param exact if true, returns the port exactly under the pointer, otherwise - closest.
   * @param zoomLevel current zoom level.
   * @returns target port.
   */
  public getTargetPort(
    ev: PointerEvent | null,
    exact = true,
    zoomLevel = 1
  ): PortConnector | undefined {
    let result: PortConnector | undefined;
    if (ev !== null && ev.target !== null) {
      this.portConnectors.forEach((port) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (port.port.enabled && port.ownsTarget(ev.target!)) {
          result = port;
        }
      });

      if (result === undefined && !exact) {
        const point = SvgHelper.clientToLocalCoordinates(
          this.container,
          ev.clientX,
          ev.clientY,
          zoomLevel
        );
        // no exact port hit, find the closest one
        let minDistance = Number.MAX_VALUE;
        this.portConnectors.forEach((port) => {
          if (port.port.enabled) {
            const distance = Math.sqrt(
              Math.pow(point.x - port.port.x, 2) +
                Math.pow(point.y - port.port.y, 2)
            );
            if (distance < minDistance) {
              result = port;
              minDistance = distance;
            }
          }
        });
      }
    }
    return result;
  }

  /**
   * Fired when stencil is created.
   */
  public onStencilCreated?: (stencilEditor: StencilBaseEditor) => void;
  /**
   * Fired when stencil changes.
   */
  public onStencilChanged?: (stencilEditor: StencilBaseEditor) => void;

  /**
   * Creates visuals for the stencil and editor.
   */
  protected setupVisuals() {
    this._stencil.createVisual();

    this.setupPortBox();
    this.setupControlBox();
  }

  private setupControlBox() {
    if (this._stencil !== undefined) {
      this._controlBox.classList.add('control-box');

      const translate = SvgHelper.createTransform();
      translate.setTranslate(-this.CB_DISTANCE / 2, -this.CB_DISTANCE / 2);
      this._controlBox.transform.baseVal.appendItem(translate);

      this.container.appendChild(this._controlBox);

      this._controlRect = SvgHelper.createRect(
        this._stencil.width + this.CB_DISTANCE,
        this._stencil.height + this.CB_DISTANCE,
        [
          ['stroke', 'black'],
          ['stroke-width', '1'],
          ['stroke-opacity', '0.5'],
          ['stroke-dasharray', '3, 2'],
          ['fill', 'transparent'],
          ['pointer-events', 'none'],
        ]
      );

      this._controlBox.appendChild(this._controlRect);

      this.addResizeGrips();

      this._controlBox.style.display = 'none';
    }
  }

  private setupPortBox() {
    if (this._stencil !== undefined) {
      this._stencil.ports.forEach((port, location) => {
        this.portConnectors.set(location, new PortConnector(port));
      });

      this._portBox.classList.add('port-box');

      const translate = SvgHelper.createTransform();
      translate.setTranslate(0, 0);
      this._portBox.transform.baseVal.appendItem(translate);

      this._connectorOutline = SvgHelper.createPath(
        this._stencil.getSelectorPathD(
          this._stencil.width,
          this._stencil.height
        ),
        [
          ['stroke', '#33ff33'],
          ['stroke-width', '6'],
          ['stroke-opacity', '0.5'],
          ['fill', 'transparent'],
          ['pointer-events', 'none'],
        ]
      );

      this._portBox.appendChild(this._connectorOutline);

      this.container.appendChild(this._portBox);

      this.addPorts();

      this._portBox.style.display = 'none';
    }
  }

  private addResizeGrips() {
    this._controlBox.appendChild(this._gripBox);

    this.resizeGrips.forEach((grip) => {
      if (grip.enabled) {
        grip.visual.transform.baseVal.appendItem(SvgHelper.createTransform());
        this._gripBox.appendChild(grip.visual);
      }
    });

    this.positionGrips();
  }

  private addPorts() {
    this.portConnectors.forEach((pc) => {
      if (pc.port.enabled) {
        pc.visual.transform.baseVal.appendItem(SvgHelper.createTransform());
        this._portBox.appendChild(pc.visual);
      }
    });

    this.positionPorts();
  }

  private positionGrips() {
    if (this._stencil) {
      const gripSize = this.resizeGrips.get('topleft')?.GRIP_SIZE || 10;

      const left = -gripSize / 2;
      const top = left;
      const cx = (this._stencil.width + this.CB_DISTANCE) / 2 - gripSize / 2;
      const cy = (this._stencil.height + this.CB_DISTANCE) / 2 - gripSize / 2;
      const bottom = this._stencil.height + this.CB_DISTANCE - gripSize / 2;
      const right = this._stencil.width + this.CB_DISTANCE - gripSize / 2;

      this.positionGrip(this.resizeGrips.get('topleft')?.visual, left, top);
      this.positionGrip(this.resizeGrips.get('topcenter')?.visual, cx, top);
      this.positionGrip(this.resizeGrips.get('topright')?.visual, right, top);
      this.positionGrip(this.resizeGrips.get('leftcenter')?.visual, left, cy);
      this.positionGrip(this.resizeGrips.get('rightcenter')?.visual, right, cy);
      this.positionGrip(
        this.resizeGrips.get('bottomleft')?.visual,
        left,
        bottom
      );
      this.positionGrip(
        this.resizeGrips.get('bottomcenter')?.visual,
        cx,
        bottom
      );
      this.positionGrip(
        this.resizeGrips.get('bottomright')?.visual,
        right,
        bottom
      );
    }
  }

  private positionPorts() {
    if (this._stencil) {
      this._stencil.positionPorts();
      this.portConnectors.forEach((pc) => {
        if (pc.port.enabled) {
          pc.adjustVisual();
        }
      });
    }
  }

  private positionGrip(
    grip: SVGGraphicsElement | undefined,
    x: number,
    y: number
  ) {
    if (grip !== undefined) {
      const translate = grip.transform.baseVal.getItem(0);
      translate.setTranslate(x, y);
      grip.transform.baseVal.replaceItem(translate, 0);
    }
  }

  /**
   * Hides the control box.
   */
  protected hideControlBox(): void {
    this._controlBox.style.display = 'none';
  }
  /**
   * Shows the control box.
   */
  protected showControlBox(): void {
    this._controlBox.style.display = '';
  }

  /**
   * Hides the port box.
   */
  protected hidePortBox(): void {
    this._portBox.style.display = 'none';
  }
  /**
   * Shows the port box.
   */
  protected showPortBox(): void {
    this._portBox.style.display = '';
  }

  private adjustControlBox() {
    if (this._stencil !== undefined) {
      const translate = this._controlBox.transform.baseVal.getItem(0);
      translate.setTranslate(
        this._stencil.left - this.CB_DISTANCE / 2,
        this._stencil.top - this.CB_DISTANCE / 2
      );
      this._controlBox.transform.baseVal.replaceItem(translate, 0);
      this._controlRect?.setAttribute(
        'width',
        (this._stencil.width + this.CB_DISTANCE).toString()
      );
      this._controlRect?.setAttribute(
        'height',
        (this._stencil.height + this.CB_DISTANCE).toString()
      );
      this.positionGrips();
    }
  }

  private adjustPortBox() {
    if (this._stencil !== undefined) {
      const translate = this._portBox.transform.baseVal.getItem(0);
      translate.setTranslate(this._stencil.left, this._stencil.top);
      this._portBox.transform.baseVal.replaceItem(translate, 0);
      if (this._connectorOutline !== undefined) {
        SvgHelper.setAttributes(this._connectorOutline, [
          [
            'd',
            this._stencil.getSelectorPathD(
              this._stencil.width,
              this._stencil.height
            ),
          ],
        ]);
      }
      this.positionPorts();
    }
  }

  /**
   * Switches the stencil editor to connect mode.
   */
  public switchToConnectMode(): void {
    this._state = 'connect';
    this.hideControlBox();
    this.showPortBox();
    // console.log('connect');
  }

  /**
   * Switches the stencil editor out of the connect mode.
   */
  public switchConnectModeOff(): void {
    if (this._state === 'connect') {
      this._state = 'select';
      this.hidePortBox();
    }
  }

  /**
   * Scales the editor and stencil.
   * @param scaleX horizontal scale factor.
   * @param scaleY vertical scale factor.
   */
  public scale(scaleX: number, scaleY: number): void {
    this._stencil?.scale(scaleX, scaleY);

    this.adjustControlBox();
    this.adjustPortBox();
    if (this.onStencilChanged) {
      this.onStencilChanged(this);
    }
  }

  /**
   * x coordinate of the top-left corner at the start of manipulation.
   */
  protected manipulationStartLeft = 0;
  /**
   * y coordinate of the top-left corner at the start of manipulation.
   */
  protected manipulationStartTop = 0;
  /**
   * Width at the start of manipulation.
   */
  protected manipulationStartWidth = 0;
  /**
   * Height at the start of manipulation.
   */
  protected manipulationStartHeight = 0;

  /**
   * x coordinate of the pointer at the start of manipulation.
   */
  protected manipulationStartX = 0;
  /**
   * y coordinate of the pointer at the start of manipulation.
   */
  protected manipulationStartY = 0;

  /**
   * Pointer's horizontal distance from the top left corner.
   */
  protected offsetX = 0;
  /**
   * Pointer's vertical distance from the top left corner.
   */
  protected offsetY = 0;

  /**
   * Initial actions when manipulation starts.
   * @param point pointer location
   */
  public initManipulation(point: IPoint): void {
    this.manipulationStartLeft = this._stencil.left;
    this.manipulationStartTop = this._stencil.top;
    this.manipulationStartWidth = this._stencil.width;
    this.manipulationStartHeight = this._stencil.height;

    this.manipulationStartX = point.x;
    this.manipulationStartY = point.y;

    this.offsetX = point.x - this._stencil.left;
    this.offsetY = point.y - this._stencil.top;
  }

  /**
   * Handles a `pointerdown` event.
   * @param point pointer location.
   * @param target event target element.
   */
  public pointerDown(point: IPoint, target?: EventTarget): void {
    if (this._stencil !== undefined) {
      this.initManipulation(point);

      if (this.state !== 'new') {
        this.activeGrip = this.findGripByVisual(target as SVGGraphicsElement);
        if (this.activeGrip !== undefined) {
          this._state = 'resize';
        } else {
          this._state = 'move';
        }
      }
    }
  }

  /**
   * Handles a double-click event.
   * @param point pointer location.
   * @param target pointer event target.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public dblClick(point: IPoint, target?: EventTarget): void {}

  /**
   * Finds a resize grip by the target visual.
   * @param target event target.
   * @returns resize grip or undefined if not found.
   */
  protected findGripByVisual(
    target: SVGGraphicsElement
  ): ResizeGrip | undefined {
    let result: ResizeGrip | undefined;

    this.resizeGrips.forEach((grip) => {
      if (grip.ownsTarget(target)) {
        result = grip;
      }
    });

    return result;
  }

  /**
   * Moves the stencil to specified location.
   * @param x horizontal location.
   * @param y vertical location.
   */
  public moveStencilTo(x?: number, y?: number) {
    if (x !== undefined) {
      this._stencil.left = x;
    }
    if (y !== undefined) {
      this._stencil.top = y;
    }
    this._stencil.moveVisual({
      x: this._stencil.left,
      y: this._stencil.top,
    });
    this.adjustControlBox();
    this.adjustPortBox();
    if (this.onStencilChanged) {
      this.onStencilChanged(this);
    }
  }

  /**
   * Handles manipulation.
   * @param point pointer location.
   */
  public manipulate(point: IPoint): void {
    if (this._stencil) {
      if (this.state === 'move') {
        this._stencil.left =
          this.manipulationStartLeft +
          (point.x - this.manipulationStartLeft) -
          this.offsetX;
        this._stencil.top =
          this.manipulationStartTop +
          (point.y - this.manipulationStartTop) -
          this.offsetY;
        this.moveStencilTo();
      } else if (this.state === 'resize') {
        this.resize(point);
        if (this.onStencilChanged) {
          this.onStencilChanged(this);
        }
      }
    }
  }

  /**
   * Resizes the stencil.
   * @param point pointer location.
   */
  protected resize(point: IPoint): void {
    if (this._stencil) {
      let newX = this.manipulationStartLeft;
      let newWidth = this.manipulationStartWidth;
      let newY = this.manipulationStartTop;
      let newHeight = this.manipulationStartHeight;

      switch (this.activeGrip) {
        case this.resizeGrips.get('bottomleft'):
        case this.resizeGrips.get('leftcenter'):
        case this.resizeGrips.get('topleft'):
          newX = this.manipulationStartLeft + point.x - this.manipulationStartX;
          newWidth =
            this.manipulationStartWidth + this.manipulationStartLeft - newX;
          break;
        case this.resizeGrips.get('bottomright'):
        case this.resizeGrips.get('rightcenter'):
        case this.resizeGrips.get('topright'):
        case undefined:
          newWidth =
            this.manipulationStartWidth + point.x - this.manipulationStartX;
          break;
      }

      switch (this.activeGrip) {
        case this.resizeGrips.get('topcenter'):
        case this.resizeGrips.get('topleft'):
        case this.resizeGrips.get('topright'):
          newY = this.manipulationStartTop + point.y - this.manipulationStartY;
          newHeight =
            this.manipulationStartHeight + this.manipulationStartTop - newY;
          break;
        case this.resizeGrips.get('bottomcenter'):
        case this.resizeGrips.get('bottomleft'):
        case this.resizeGrips.get('bottomright'):
        case undefined:
          newHeight =
            this.manipulationStartHeight + point.y - this.manipulationStartY;
          break;
      }

      if (newWidth >= 0) {
        this._stencil.left = newX;
        this._stencil.width = newWidth;
      } else {
        this._stencil.left = newX + newWidth;
        this._stencil.width = -newWidth;
      }
      if (newHeight >= 0) {
        this._stencil.top = newY;
        this._stencil.height = newHeight;
      } else {
        this._stencil.top = newY + newHeight;
        this._stencil.height = -newHeight;
      }

      this.setSize();
    }
  }

  /**
   * Adjusts stencil and editor size.
   */
  protected setSize(): void {
    if (this._stencil) {
      this._stencil.setSize();
    }
    this.adjustControlBox();
    this.adjustPortBox();
  }

  /**
   * When set to true `stencilcreate` event isn't fired.
   */
  protected _suppressStencilCreateEvent = false;
  public pointerUp(point: IPoint): void {
    if (this._stencil) {
      this._state = 'select';
      this.manipulate(point);
    }
  }

  /**
   * Creates a stencil at specified location.
   * @param point location at which to create the stencil.
   */
  public create(point: IPoint): void {
    if (this._stencil !== undefined && this.state === 'new') {
      this.setupVisuals();
      const position: IPoint = {
        x: point.x - this._stencil.defaultSize.width / 2,
        y: point.y - this._stencil.defaultSize.height / 2,
      };
      this._stencil.left = position.x;
      this._stencil.top = position.y;
      this._stencil.moveVisual(position);
      this._stencil.width = this._stencil.defaultSize.width;
      this._stencil.height = this._stencil.defaultSize.height;

      this._state = 'select';

      if (this.onStencilCreated && this._suppressStencilCreateEvent === false) {
        this.onStencilCreated(this);
      }
    }
  }

  /**
   * Is stencil selected?
   */
  protected _isSelected = false;
  /**
   * Returns true if the stencil is selected.
   */
  public get isSelected(): boolean {
    return this._isSelected;
  }
  /**
   * Is stencil in focus?
   */
  protected _isFocused = false;
  /**
   * Returns true if the stencil is in focus.
   */
  public get isFocused(): boolean {
    return this._isFocused;
  }

  /**
   * Select the stencil.
   */
  public select(): void {
    this.container.style.cursor = 'move';
    this._isSelected = true;

    this.adjustControlBox();
    this._controlBox.style.display = '';
    if (this._controlRect) {
      this._controlRect.style.display = '';
    }
    this._gripBox.style.display = 'none';
  }

  /**
   * Deselect the stencil.
   */
  public deselect(): void {
    this.container.style.cursor = 'default';
    this._isSelected = false;
    this._controlBox.style.display = 'none';
    this.blur();
  }

  /**
   * Puts the stencil editor in focus.
   */
  public focus(): void {
    this.select();
    this._isFocused = true;
    this._gripBox.style.display = '';
  }

  /**
   * Unfocus the stencil.
   */
  public blur(): void {
    this._gripBox.style.display = 'none';
    this._isFocused = false;
  }

  /**
   * Returns property panels for the UI for this stencil.
   */
  public get propertyPanels(): PropertyPanelBase[] {
    this.shapePanel.fillColor = this.stencil.fillColor;
    this.shapePanel.strokeColor = this.stencil.strokeColor;
    return [this.shapePanel];
  }

  /**
   * Restores the stencil from previously saved state.
   * @param state stencil state (configuration)
   */
  public restoreState(state: StencilBaseState): void {
    this.stencil.restoreState(state);
    this.setupControlBox();
    this.setupPortBox();
    this.adjustControlBox();
    this.adjustPortBox();
    this._state = 'select';
  }
}
