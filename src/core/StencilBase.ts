import { DiagramSettings } from './DiagramSettings';
import { IPoint } from './IPoint';
import { ISize } from './ISize';
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

  private _settings: DiagramSettings;
  protected get settings(): DiagramSettings {
    return this._settings;
  }

  public notes?: string;

  public onStencilCreated?: (stencil: StencilBase) => void;

  protected _defaultSize: ISize = { width: 120, height: 70 }
  public get defaultSize(): ISize {
    return this._defaultSize;
  }
  public set defaultSize(value: ISize) {
    this._defaultSize = value;
    this.width = value.width;
    this.height = value.height;
  }

  public left = 0;
  public top = 0;
  public width = this._defaultSize.width;
  public height = this._defaultSize.height;
  public get right(): number {
    return this.left + this.width;
  }
  public get bottom(): number {
    return this.top + this.height;
  }

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

  protected _fillColor = '#eeeeee';
  public get fillColor() {
    return this._fillColor;
  }
  protected _strokeColor = 'black';
  public get strokeColor() {
    return this._strokeColor;
  }
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

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    this._iid = iid;
    this._container = container;
    this._settings = settings;

    this.getPathD = this.getPathD.bind(this);
    this.getSelectorPathD = this.getSelectorPathD.bind(this);

    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.setFillColor = this.setFillColor.bind(this);
    this.setStrokeWidth = this.setStrokeWidth.bind(this);
    this.setStrokeDasharray = this.setStrokeDasharray.bind(this);
    this.createVisual = this.createVisual.bind(this);
    this.createSelector = this.createSelector.bind(this);
    this.adjustSelector = this.adjustSelector.bind(this);
    this.adjustVisual = this.adjustVisual.bind(this);

    this._strokeColor = this.settings.getColor(this.typeName, 'stroke');
    this._fillColor = this.settings.getColor(this.typeName, 'fill');
    this.setStrokeWidth(this.settings.getStrokeWidth(this.typeName));
    this.strokeDasharray = this.settings.getDashArray(this.typeName);
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

  public getSelectorPathD(width: number, height: number): string {
    return this.getPathD(width, height);
  }

  protected createSelector(): void {
    const pathString = this.getSelectorPathD(
      this.defaultSize.width,
      this.defaultSize.height
    );
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
    const pathString = this.getPathD(
      this.defaultSize.width,
      this.defaultSize.height
    );
    if (pathString && pathString.length > 0) {
      this._frame = SvgHelper.createPath(pathString, [
        ['fill', this._fillColor],
        ['stroke', this._strokeColor],
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
        ['d', this.getSelectorPathD(this.width, this.height)],
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
    this._strokeColor = color;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [['stroke', this._strokeColor]]);
    }
  }
  public setFillColor(color: string): void {
    this._fillColor = color;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [['fill', this._fillColor]]);
    }
  }
  public setStrokeWidth(width: number | string): void {
    const numWidth = typeof(width) === 'string' ? Number.parseFloat(width) : width;
    this.strokeWidth = numWidth;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [
        ['stroke-width', this.strokeWidth.toString()],
      ]);
    }
  }
  public setStrokeDasharray(dashes: string): void {
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

      fillColor: this._fillColor,
      strokeColor: this._strokeColor,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray,
    };
  }

  public restoreState(state: StencilBaseState): void {
    this._iid = state.iid;
    this.notes = state.notes;

    this.left = state.left;
    this.top = state.top;
    if (state.width !== undefined) {
      this.width = state.width;
    }
    if (state.height !== undefined) {
      this.height = state.height;
    }
    if (state.fillColor !== undefined) {
      this._fillColor = state.fillColor;
    }
    if (state.strokeColor !== undefined) {
      this._strokeColor = state.strokeColor;
    }
    if (state.strokeWidth !== undefined) {
      this.strokeWidth = state.strokeWidth;
    }
    if (state.strokeDasharray !== undefined) {
      this.strokeDasharray = state.strokeDasharray;
    }

    this.createVisual();
    this.setSize();
    this.positionPorts();
  }
}
