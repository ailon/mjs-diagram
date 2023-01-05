import { ConnectorBase } from '../core/ConnectorBase';
import { IPoint } from '../core/IPoint';
import { ResizeGrip } from './ResizeGrip';
import { SvgHelper } from '../core/SvgHelper';
import { Port } from '../core/Port';
import { ConnectorBaseState, ConnectorEndPoints } from '../core/ConnectorBaseState';

export type ConnectorState = 'new' | 'creating' | 'select' | 'move';

export class ConnectorBaseEditor {
  protected _state: ConnectorState = 'new';
  public get state(): ConnectorState {
    return this._state;
  }

  public onConnectorCreated?: (connector: ConnectorBaseEditor) => void;
  public onConnectorUpdated?: (connector: ConnectorBaseEditor) => void;

  protected manipulationStartX = 0;
  protected manipulationStartY = 0;

  private manipulationStartX1 = 0;
  private manipulationStartY1 = 0;
  private manipulationStartX2 = 0;
  private manipulationStartY2 = 0;

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

  public connector: ConnectorBase;
  public movingPort?: Port;

  protected overlayContainer: HTMLDivElement;

  constructor(
    iid: number,
    container: SVGGElement, 
    overlayContainer: HTMLDivElement, 
    connectorType: typeof ConnectorBase, 
    connector?: ConnectorBase
  ) {
    this.connector = connector ?? new connectorType(iid, container);
    this.connector.container = container;
    this.overlayContainer = overlayContainer;

    this.setupControlBox();    

    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);
    this.setupControlBox = this.setupControlBox.bind(this);
    this.adjustControlBox = this.adjustControlBox.bind(this);
    this.showControlBox = this.showControlBox.bind(this);
    this.hideControlBox = this.hideControlBox.bind(this);
    this.restoreState = this.restoreState.bind(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public ownsTarget(el: EventTarget | null): boolean {
    let found = false;
    if (el !== null) {
      if (
        this.grip1.ownsTarget(el) || this.grip2.ownsTarget(el) ||
        this.connector.ownsTarget(el)
      ) {
        found = true;
      } else {
        found = false;
      }
    }
    return found;
  }

  protected _isSelected = false;
  public get isSelected(): boolean {
    return this._isSelected;
  }

  public select(): void {
    this.connector.container.style.cursor = 'move';
    this._isSelected = true;
    this.adjustControlBox();
    this.showControlBox();
  }

  public deselect(): void {
    this.connector.container.style.cursor = 'default';
    this._isSelected = false;
    this.hideControlBox();
  }

  protected hideControlBox(): void {
    this.controlBox.style.display = 'none';
  }
  protected showControlBox(): void {
    this.controlBox.style.display = '';
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public pointerDown(point: IPoint, target?: EventTarget):void {
    this.manipulationStartX = point.x;
    this.manipulationStartY = point.y;

    if (this.state === 'new') {
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
      } else {
        this.activeGrip = undefined;
        this.movingPort = undefined;
      }

      if (this.activeGrip) {
        this._state = 'move';
        SvgHelper.setAttributes(this.connector.container, [['pointer-events', 'none']]);
      } else {
        this._state = 'select';
      }
    } else {
      this.connector.adjustVisual();
      this.showControlBox();

      this._state = 'creating';
      SvgHelper.setAttributes(this.connector.container, [['pointer-events', 'none']]);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public dblClick(point: IPoint, target?: EventTarget):void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public manipulate(point: IPoint):void {
    if (this.state === 'creating') {
      this.resize(point);
    } else if (this.state === 'move') {
      if (this.activeGrip === this.grip1) {
        this.connector.setStartPosition({ 
          x: this.manipulationStartX1 + point.x - this.manipulationStartX,
          y: this.manipulationStartY1 + point.y - this.manipulationStartY
        });
      } else if (this.activeGrip === this.grip2) {
        this.connector.setEndPosition({ 
          x: this.manipulationStartX2 + point.x - this.manipulationStartX,
          y: this.manipulationStartY2 + point.y - this.manipulationStartY
        });
      }
      this.adjustControlBox();
    }
  }

  protected resize(point: IPoint): void {
    switch(this.activeGrip) {
      case this.grip1:
        this.connector.setStartPosition({ x: point.x, y: point.y});
        break; 
      case this.grip2:
      case undefined:
        this.connector.setEndPosition({ x: point.x, y: point.y});
        break; 
    }
    this.adjustControlBox();
  }

  protected setupControlBox(): void {
    this.controlBox = SvgHelper.createGroup();
    this.connector.container.appendChild(this.controlBox);

    this.addControlGrips();

    this.controlBox.style.display = 'none';
  }

  private adjustControlBox() {
    this.positionGrips();
  }

  protected addControlGrips(): void {
    this.grip1 = this.createGrip();
    this.grip2 = this.createGrip();

    this.positionGrips();
  }

  protected createGrip(): ResizeGrip {
    const grip = new ResizeGrip();
    grip.visual.transform.baseVal.appendItem(SvgHelper.createTransform());
    this.controlBox.appendChild(grip.visual);

    return grip;
  }

  protected positionGrips(): void {
    const gripSize = this.grip1.GRIP_SIZE;

    this.positionGrip(this.grip1.visual, this.connector.x1 - gripSize / 2, this.connector.y1 - gripSize / 2);
    this.positionGrip(this.grip2.visual, this.connector.x2 - gripSize / 2, this.connector.y2 - gripSize / 2);
  }

  protected positionGrip(grip: SVGGraphicsElement, x: number, y: number): void {
    const translate = grip.transform.baseVal.getItem(0);
    translate.setTranslate(x, y);
    grip.transform.baseVal.replaceItem(translate, 0);
  }

  public pointerUp(point: IPoint):void {
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
    }

    SvgHelper.setAttributes(this.connector.container, [['pointer-events', 'auto']]);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public dispose(): void {}


  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public scale(scaleX: number, scaleY: number): void {
    this.connector.scale(scaleX, scaleY);
    this.adjustControlBox();
  }

  public restoreState(state: ConnectorBaseState, endPoints: ConnectorEndPoints): void {
    this.connector.restoreState(state, endPoints);
    this.adjustControlBox();
    this._state = 'select';
  }
}
