import { IPoint } from './IPoint';
import { Port, PortLocation } from './Port';
import { StencilBaseState } from './StencilBaseState';
import { SvgHelper } from './SvgHelper';

export class StencilBase {
  public static typeName = 'StencilBase';

  public get typeName(): string {
    return Object.getPrototypeOf(this).constructor.typeName;
  }

  public static title: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected static getPathD(width: number, height: number): string {
    return '';
  }

  private _iid: number;
  public get IId(): number {
    return this._iid;
  }

  protected _container: SVGGElement;
  public get container(): SVGGElement {
    return this._container;
  }

  public notes?: string;

  public onStencilCreated?: (stencil: StencilBase) => void;

  public left = 0;
  public top = 0;
  public width = 0;
  public height = 0;

  public defaultSize: IPoint = { x: 50, y: 20 };

  protected get centerX(): number {
    return this.left + this.width / 2;
  }
  protected get centerY(): number {
    return this.top + this.height / 2;
  }

  protected _selectorFrame?: SVGElement;
  protected _frame?: SVGElement;

  // @todo: proper initializer needed or accept undefined?
  private _visual: SVGGraphicsElement = SvgHelper.createGroup();
  protected get visual(): SVGGraphicsElement {
    return this._visual;
  }
  protected set visual(value: SVGGraphicsElement) {
    this._visual = value;
    const translate = SvgHelper.createTransform();
    this._visual.transform.baseVal.appendItem(translate);
  }

  protected fillColor = '#eeeeee';
  protected strokeColor = 'black';
  protected strokeWidth = 1;
  protected strokeDasharray = '';

  public ports = new Map<PortLocation, Port>([
    ['topleft', new Port('topleft')],
    ['topcenter', new Port('topcenter')],
    ['topright', new Port('topright')],
    ['leftcenter', new Port('leftcenter')],
    ['rightcenter', new Port('rightcenter')],
    ['bottomleft', new Port('bottomleft')],
    ['bottomcenter', new Port('bottomcenter')],
    ['bottomright', new Port('bottomright')],
  ]);

  constructor(iid: number, container: SVGGElement) {
    this._iid = iid;
    this._container = container;

    this.getPathD = this.getPathD.bind(this);

    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.setFillColor = this.setFillColor.bind(this);
    this.setStrokeWidth = this.setStrokeWidth.bind(this);
    this.setStrokeDasharray = this.setStrokeDasharray.bind(this);
    this.createVisual = this.createVisual.bind(this);
    this.createSelector = this.createSelector.bind(this);
    this.adjustSelector = this.adjustSelector.bind(this);
    this.adjustVisual = this.adjustVisual.bind(this);
  }

  protected static getThumbnailSVG(
    width: number,
    height: number
  ): SVGSVGElement {
    const result = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    result.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    result.setAttribute('width', width.toString());
    result.setAttribute('height', height.toString());
    result.setAttribute(
      'viewBox',
      '0 0 ' + width.toString() + ' ' + height.toString()
    );

    return result;
  }

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const result = StencilBase.getThumbnailSVG(width, height);

    const pathD = this.getPathD(width, height);
    if (pathD && pathD.length > 0) {
      const frame = SvgHelper.createPath(pathD);
      result.appendChild(frame);
    }

    return result;
  }

  public ownsTarget(el: EventTarget): boolean {
    if (
      el === this.visual ||
      el === this._frame ||
      el === this._selectorFrame
    ) {
      return true;
    } else {
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public dispose(): void {}

  public scale(scaleX: number, scaleY: number): void {
    this.left = this.left * scaleX;
    this.top = this.top * scaleY;
    this.width = this.width * scaleX;
    this.height = this.height * scaleY;

    this.setSize();
  }

  public disablePorts(...portLocations: PortLocation[]): void {
    if (portLocations && portLocations.length > 0) {
      portLocations.forEach((pl) => {
        const port = this.ports.get(pl);
        if (port !== undefined) {
          port.enabled = false;
        }
      });
    }
  }

  protected getPathD(width: number, height: number): string {
    return Object.getPrototypeOf(this).constructor.getPathD(width, height);
  }

  protected createSelector(): void {
    const pathString = this.getPathD(this.defaultSize.x, this.defaultSize.y);
    if (pathString && pathString.length > 0) {
      this._selectorFrame = SvgHelper.createPath(pathString, [
        ['fill', 'transparent'],
        ['stroke', 'transparent'],
        ['stroke-width', '15px'],
      ]);
      this.visual.appendChild(this._selectorFrame);
    }
  }

  public createVisual(): void {
    this.createSelector();
    const pathString = this.getPathD(this.defaultSize.x, this.defaultSize.y);
    if (pathString && pathString.length > 0) {
      this._frame = SvgHelper.createPath(pathString, [
        ['fill', this.fillColor],
        ['stroke', this.strokeColor],
        ['stroke-width', this.strokeWidth.toString()],
        ['stroke-dasharray', this.strokeDasharray],
      ]);
      this.visual.appendChild(this._frame);
      this.addVisualToContainer(this.visual);
    }
  }

  protected addVisualToContainer(element: SVGElement): void {
    if (this.container.childNodes.length > 0) {
      this.container.insertBefore(element, this.container.childNodes[0]);
    } else {
      this.container.appendChild(element);
    }
  }

  public moveVisual(point: IPoint): void {
    this.visual.style.transform = `translate(${point.x}px, ${point.y}px)`;
  }

  protected adjustSelector() {
    if (this._selectorFrame !== undefined) {
      SvgHelper.setAttributes(this._selectorFrame, [
        ['d', this.getPathD(this.width, this.height)],
      ]);
    }
  }

  protected adjustVisual() {
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [
        ['d', this.getPathD(this.width, this.height)],
      ]);
    }
  }

  public setSize(): void {
    this.moveVisual({ x: this.left, y: this.top });
    this.adjustSelector();
    this.adjustVisual();
  }

  public setStrokeColor(color: string): void {
    this.strokeColor = color;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [['stroke', this.strokeColor]]);
    }
  }
  public setFillColor(color: string): void {
    this.fillColor = color;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [['fill', this.fillColor]]);
    }
  }
  protected setStrokeWidth(width: number): void {
    this.strokeWidth = width;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [
        ['stroke-width', this.strokeWidth.toString()],
      ]);
    }
  }
  protected setStrokeDasharray(dashes: string): void {
    this.strokeDasharray = dashes;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [
        ['stroke-dasharray', this.strokeDasharray],
      ]);
    }
  }

  public getPortPosition(location: PortLocation): IPoint {
    const port = this.ports.get(location);
    const result: IPoint = {
      x: this.left + (port?.x || 0),
      y: this.top + (port?.y || 0),
    };

    return result;
  }

  public positionPorts(): void {
    const left = 0;
    const top = left;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const bottom = this.height;
    const right = this.width;

    this.positionPort(this.ports.get('topleft'), left, top);
    this.positionPort(this.ports.get('topcenter'), cx, top);
    this.positionPort(this.ports.get('topright'), right, top);
    this.positionPort(this.ports.get('leftcenter'), left, cy);
    this.positionPort(this.ports.get('rightcenter'), right, cy);
    this.positionPort(this.ports.get('bottomleft'), left, bottom);
    this.positionPort(this.ports.get('bottomcenter'), cx, bottom);
    this.positionPort(this.ports.get('bottomright'), right, bottom);
  }

  private positionPort(port: Port | undefined, x: number, y: number) {
    if (port !== undefined) {
      port.x = x;
      port.y = y;
    }
  }

  public getState(): StencilBaseState {
    return {
      typeName: this.typeName,
      iid: this.IId,
      notes: this.notes,

      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,

      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray,
    };
  }

  public restoreState(state: StencilBaseState): void {
    this._iid = state.iid;
    this.notes = state.notes;

    this.left = state.left;
    this.top = state.top;
    this.width = state.width;
    this.height = state.height;

    this.fillColor = state.fillColor;
    this.strokeColor = state.strokeColor;
    this.strokeWidth = state.strokeWidth;
    this.strokeDasharray = state.strokeDasharray;

    this.createVisual();
    this.setSize();
    this.positionPorts();
  }
}
