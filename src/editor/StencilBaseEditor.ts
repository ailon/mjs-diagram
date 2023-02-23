import { ColorPickerPanel } from './panels/ColorPickerPanel';
import { IPoint } from '../core/IPoint';
import { PortLocation } from '../core/Port';
import { PortConnector } from './PortConnector';
import { PropertyPanelBase } from './panels/PropertyPanelBase';
import { GripLocation, ResizeGrip } from './ResizeGrip';
import { StencilBase } from '../core/StencilBase';
import { StencilBaseState } from '../core/StencilBaseState';
import { SvgHelper } from '../core/SvgHelper';

export type StencilEditorState =
  | 'new'
  | 'creating'
  | 'select'
  | 'focus'
  | 'move'
  | 'resize'
  | 'edit'
  | 'connect';

export class StencilBaseEditor {
  // @todo switch type to use the generic
  protected _stencilType: typeof StencilBase;
  protected _stencil: StencilBase;
  public get stencil(): StencilBase {
    return this._stencil;
  }

  protected _container: SVGGElement;
  public get container(): SVGGElement {
    return this._container;
  }

  protected _overlayContainer: HTMLDivElement;
  public get overlayContainer(): HTMLDivElement {
    return this._overlayContainer;
  }

  protected _state: StencilEditorState = 'new';
  public get state(): StencilEditorState {
    return this._state;
  }
  public set state(value: StencilEditorState) {
    this._state = value;
  }

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
  protected activeGrip?: ResizeGrip;

  protected portConnectors = new Map<PortLocation, PortConnector>();

  protected _controlBox = SvgHelper.createGroup();
  protected _gripBox = SvgHelper.createGroup();
  private readonly CB_DISTANCE: number = 10;
  private _controlRect?: SVGRectElement;

  protected _portBox = SvgHelper.createGroup();
  protected _connectorOutline?: SVGPathElement;

  private strokePanel: ColorPickerPanel;
  private fillPanel: ColorPickerPanel;

  constructor(
    iid: number,
    container: SVGGElement,
    overlayContainer: HTMLDivElement,
    stencilType: typeof StencilBase,
    stencil?: StencilBase
  ) {
    this._container = container;
    this._overlayContainer = overlayContainer;
    this._stencilType = stencilType;
    this._stencil = stencil ?? new stencilType(iid, container);

    this.strokePanel = new ColorPickerPanel(
      'Line color',
      [
        'red',
        'orange',
        'yellow',
        'green',
        'lightblue',
        'blue',
        'magenta',
        'black',
        'white',
        'brown',
      ],
      'blue'
    );
    this.strokePanel.onColorChanged = this._stencil.setStrokeColor;

    this.fillPanel = new ColorPickerPanel(
      'Fill color',
      ['#cccccc', '#ffcccc', '#ccffcc', '#ccccff', 'transparent'],
      'blue'
    );
    this.fillPanel.onColorChanged = this._stencil.setFillColor;

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
  }

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

  public onStencilCreated?: (stencilEditor: StencilBaseEditor) => void;
  public onStencilChanged?: (stencilEditor: StencilBaseEditor) => void;

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

  protected hideControlBox(): void {
    this._controlBox.style.display = 'none';
  }
  protected showControlBox(): void {
    this._controlBox.style.display = '';
  }

  protected hidePortBox(): void {
    this._portBox.style.display = 'none';
  }
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

  public switchToConnectMode(): void {
    this._state = 'connect';
    this.hideControlBox();
    this.showPortBox();
    console.log('connect');
  }

  public switchConnectModeOff(): void {
    if (this._state === 'connect') {
      this._state = 'select';
      this.hidePortBox();
    }
  }

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

  public pointerDown(point: IPoint, target?: EventTarget): void {
    if (this._stencil !== undefined) {
      if (this.state === 'new') {
        this.setupVisuals();
        this._stencil.left = point.x;
        this._stencil.top = point.y;
      }

      this.initManipulation(point);

      if (this.state !== 'new') {
        this.activeGrip = this.findGripByVisual(target as SVGGraphicsElement);
        if (this.activeGrip !== undefined) {
          this._state = 'resize';
        } else {
          this._state = 'move';
        }
      } else {
        this._stencil.moveVisual(point);

        this._state = 'creating';
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public dblClick(point: IPoint, target?: EventTarget): void {}

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

  public manipulate(point: IPoint): void {
    if (this._stencil) {
      //console.log(this._stencil);
      if (this.state === 'creating') {
        this.resize(point);
      } else if (this.state === 'move') {
        this._stencil.left =
          this.manipulationStartLeft +
          (point.x - this.manipulationStartLeft) -
          this.offsetX;
        this._stencil.top =
          this.manipulationStartTop +
          (point.y - this.manipulationStartTop) -
          this.offsetY;
        this._stencil.moveVisual({
          x: this._stencil.left,
          y: this._stencil.top,
        });
        this.adjustControlBox();
        this.adjustPortBox();
        if (this.onStencilChanged) {
          this.onStencilChanged(this);
        }
      } else if (this.state === 'resize') {
        this.resize(point);
        if (this.onStencilChanged) {
          this.onStencilChanged(this);
        }
      }
    }
  }

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

  protected setSize(): void {
    if (this._stencil) {
      this._stencil.setSize();
    }
    this.adjustControlBox();
    this.adjustPortBox();
  }

  protected _suppressStencilCreateEvent = false;
  public pointerUp(point: IPoint): void {
    if (this._stencil) {
      const inState = this.state;
      this._state = 'select';
      if (
        inState === 'creating' &&
        this._stencil.width < 10 &&
        this._stencil.height < 10
      ) {
        this._stencil.width = this._stencil.defaultSize.width;
        this._stencil.height = this._stencil.defaultSize.height;
      } else {
        this.manipulate(point);
      }

      if (
        inState === 'creating' &&
        this.onStencilCreated &&
        this._suppressStencilCreateEvent === false
      ) {
        this.onStencilCreated(this);
      }
    }
  }

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

  protected _isSelected = false;
  public get isSelected(): boolean {
    return this._isSelected;
  }
  protected _isFocused = false;
  public get isFocused(): boolean {
    return this._isFocused;
  }

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

  public deselect(): void {
    this.container.style.cursor = 'default';
    this._isSelected = false;
    this._controlBox.style.display = 'none';
    this.blur();
  }

  public focus(): void {
    this.select();
    this._isFocused = true;
    this._gripBox.style.display = '';
  }

  public blur(): void {
    this._gripBox.style.display = 'none';
    this._isFocused = false;
  }

  public get propertyPanels(): PropertyPanelBase[] {
    return [this.strokePanel, this.fillPanel];
  }

  public restoreState(state: StencilBaseState): void {
    this.stencil.restoreState(state);
    this.setupControlBox();
    this.setupPortBox();
    this.adjustControlBox();
    this.adjustPortBox();
    this._state = 'select';
  }
}
