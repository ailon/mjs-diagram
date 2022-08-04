import { ConnectorBaseState } from './ConnectorBaseState';
import { IPoint } from './IPoint';
import { Port } from './Port';
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';

export class ConnectorBase {
  public static typeName = 'ConnectorBase';

  public get typeName(): string {
    return Object.getPrototypeOf(this).constructor.typeName;
  }

  private _iid: number;
  public get IId(): number {
    return this._iid;
  }

  public container: SVGGElement;

  public startStencil?: StencilBase;
  public startPort?: Port;
  public endStencil?: StencilBase;
  public endPort?: Port;

  public x1 = 0;
  public y1 = 0;
  public x2 = 0;
  public y2 = 0;

  public visual: SVGGraphicsElement = SvgHelper.createGroup();

  public visibleLine!: SVGLineElement;
  public selectorLine!: SVGLineElement;
  public strokeColor = '#3333ff';
  public strokeWidth = 1;
  public strokeDasharray = '';

  constructor(iid: number, container: SVGGElement) {
    this._iid = iid;
    this.container = container;

    this.createVisual();
  }

  public ownsTarget(el: EventTarget): boolean {
    if (
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

  public addMarkerVisualToContainer(element: SVGElement): void {
    if (this.container.childNodes.length > 0) {
      this.container.insertBefore(element, this.container.childNodes[0]);
    } else {
      this.container.appendChild(element);
    }
  }

  public adjustVisual(): void {
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

  public scale(scaleX: number, scaleY: number): void {
    this.x1 = this.x1 * scaleX;
    this.y1 = this.y1 * scaleY;
    this.x2 = this.x2 * scaleX;
    this.y2 = this.y2 * scaleY;

    this.adjustVisual();
  }
  
  public getState(): ConnectorBaseState {
    return {
      typeName: this.typeName,
      iid: this.IId,

      startStencilId: this.startStencil?.IId,
      startPortLocation: this.startPort?.location,

      endStencilId: this.endStencil?.IId,
      endPortLocation: this.endPort?.location,

      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray
    }
  }

}