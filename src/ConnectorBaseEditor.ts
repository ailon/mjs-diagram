import { IPoint } from './IPoint';
import { Port } from './Port';
import { ResizeGrip } from './ResizeGrip';
import { SvgHelper } from './SvgHelper';

export type ConnectorState = 'new' | 'creating' | 'select' | 'move';

export class ConnectorBaseEditor {

  public static typeName = 'ConnectorBase';

  public get typeName(): string {
    return Object.getPrototypeOf(this).constructor.typeName;
  }

  protected _container: SVGGElement;
  public get container(): SVGGElement {
    return this._container;
  }
  protected _state: ConnectorState = 'new';
  public get state(): ConnectorState {
    return this._state;
  }

  public startPort?: Port;
  public endPort?: Port;

  public onConnectorCreated?: (connector: ConnectorBaseEditor) => void;

  protected x1 = 0;
  protected y1 = 0;
  protected x2 = 0;
  protected y2 = 0;

  protected manipulationStartX = 0;
  protected manipulationStartY = 0;

  private manipulationStartX1 = 0;
  private manipulationStartY1 = 0;
  private manipulationStartX2 = 0;
  private manipulationStartY2 = 0;

  protected visual: SVGGraphicsElement = SvgHelper.createGroup();

  protected selectorLine!: SVGLineElement;
  protected visibleLine!: SVGLineElement;
  protected strokeColor = '#3333ff';
  protected strokeWidth = 1;
  protected strokeDasharray = '';


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


  constructor(container: SVGGElement) {
    this._container = container;

    this.createVisual();
    this.setupControlBox();    
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public ownsTarget(el: EventTarget): boolean {
    if (
      this.grip1.ownsTarget(el) || this.grip2.ownsTarget(el) ||
      el === this.visual ||
      el === this.selectorLine ||
      el === this.visibleLine
    ) {
      return true;
    } else {
      return false;
    }
  }

  private createVisual() {
    this.selectorLine = SvgHelper.createLine(
      this.x1,
      this.y1,
      this.x2,
      this.y2,
      [
        ['stroke', 'transparent'],
        ['stroke-width', (this.strokeWidth + 10).toString()],
      ]
    );
    this.visibleLine = SvgHelper.createLine(
      this.x1,
      this.y1,
      this.x2,
      this.y2,
      [
        ['stroke', this.strokeColor],
        ['stroke-width', this.strokeWidth.toString()],
      ]
    );
    this.visual.appendChild(this.selectorLine);
    this.visual.appendChild(this.visibleLine);

    this.addMarkerVisualToContainer(this.visual);
  }


  protected _isSelected = false;
  public get isSelected(): boolean {
    return this._isSelected;
  }

  public select(): void {
    this.container.style.cursor = 'move';
    this._isSelected = true;
    this.adjustControlBox();
    this.controlBox.style.display = '';
  }

  public deselect(): void {
    this.container.style.cursor = 'default';
    this._isSelected = false;
    this.controlBox.style.display = 'none';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public pointerDown(point: IPoint, target?: EventTarget):void {
    this.manipulationStartX = point.x;
    this.manipulationStartY = point.y;

    if (this.state === 'new') {
      this.x1 = point.x;
      this.y1 = point.y;
      this.x2 = point.x;
      this.y2 = point.y;
    }

    this.manipulationStartX1 = this.x1;
    this.manipulationStartY1 = this.y1;
    this.manipulationStartX2 = this.x2;
    this.manipulationStartY2 = this.y2;

    if (this.state !== 'new') {
      this.select();
      if (target && this.grip1.ownsTarget(target)) {
        this.activeGrip = this.grip1;
      } else if (target && this.grip2.ownsTarget(target)) {
        this.activeGrip = this.grip2;
      } else {
        this.activeGrip = undefined;
      }

      if (this.activeGrip) {
        this._state = 'move';
      } else {
        this._state = 'select';
      }
    } else {
      this.adjustVisual();

      this._state = 'creating';
      SvgHelper.setAttributes(this._container, [['pointer-events', 'none']]);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public dblClick(point: IPoint, target?: EventTarget):void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public manipulate(point: IPoint):void {
    if (this.state === 'creating') {
      this.resize(point);
    } else if (this.state === 'move') {
      this.x1 = this.manipulationStartX1 + point.x - this.manipulationStartX;
      this.y1 = this.manipulationStartY1 + point.y - this.manipulationStartY;
      this.x2 = this.manipulationStartX2 + point.x - this.manipulationStartX;
      this.y2 = this.manipulationStartY2 + point.y - this.manipulationStartY;
      this.adjustVisual();
      this.adjustControlBox();
    }
  }

  protected resize(point: IPoint): void {
    switch(this.activeGrip) {
      case this.grip1:
        this.x1 = point.x;
        this.y1 = point.y;
        break; 
      case this.grip2:
      case undefined:
        this.x2 = point.x;
        this.y2 = point.y;
        break; 
    }
    this.adjustVisual();
    this.adjustControlBox();
  }

  protected setupControlBox(): void {
    this.controlBox = SvgHelper.createGroup();
    this.container.appendChild(this.controlBox);

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

    this.positionGrip(this.grip1.visual, this.x1 - gripSize / 2, this.y1 - gripSize / 2);
    this.positionGrip(this.grip2.visual, this.x2 - gripSize / 2, this.y2 - gripSize / 2);
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
    if (inState === 'creating' && this.onConnectorCreated) {
      this.onConnectorCreated(this);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public dispose(): void {}

  protected addMarkerVisualToContainer(element: SVGElement): void {
    if (this.container.childNodes.length > 0) {
      this.container.insertBefore(element, this.container.childNodes[0]);
    } else {
      this.container.appendChild(element);
    }
  }

  protected adjustVisual(): void {
    if (this.selectorLine && this.visibleLine) {
      this.selectorLine.setAttribute('x1', this.x1.toString());
      this.selectorLine.setAttribute('y1', this.y1.toString());
      this.selectorLine.setAttribute('x2', this.x2.toString());
      this.selectorLine.setAttribute('y2', this.y2.toString());

      this.visibleLine.setAttribute('x1', this.x1.toString());
      this.visibleLine.setAttribute('y1', this.y1.toString());
      this.visibleLine.setAttribute('x2', this.x2.toString());
      this.visibleLine.setAttribute('y2', this.y2.toString());

      SvgHelper.setAttributes(this.visibleLine, [['stroke', this.strokeColor]]);
      SvgHelper.setAttributes(this.visibleLine, [['stroke-width', this.strokeWidth.toString()]]);
      SvgHelper.setAttributes(this.visibleLine, [['stroke-dasharray', this.strokeDasharray.toString()]]);
    }
  }

  public setStartPosition(point: IPoint) {
    this.x1 = point.x;
    this.y1 = point.y;
    this.adjustVisual();
  }

  public setEndPosition(point: IPoint) {
    this.x2 = point.x;
    this.y2 = point.y;
    this.adjustVisual();
  }
  
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public scale(scaleX: number, scaleY: number): void {
    this.x1 = this.x1 * scaleX;
    this.y1 = this.y1 * scaleY;
    this.x2 = this.x2 * scaleX;
    this.y2 = this.y2 * scaleY;

    this.adjustVisual();
    this.adjustControlBox();
  }
}
