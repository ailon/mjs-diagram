import { IPoint } from './IPoint';
import { Port, PortLocation } from './Port';
import { SvgHelper } from './SvgHelper';

export class StencilBase {
  public static typeName = 'StencilBase';

  public get typeName(): string {
    return Object.getPrototypeOf(this).constructor.typeName;
  }

  public static title: string;

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

  public defaultSize: IPoint = {x: 50, y: 20};  

  protected get centerX(): number {
    return this.left + this.width / 2;
  }
  protected get centerY(): number {
    return this.top + this.height / 2;
  }  

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

  public ports = new Map<PortLocation, Port>(
    [
      ['topleft', new Port()],
      ['topcenter', new Port()],
      ['topright', new Port()],
      ['leftcenter', new Port()],
      ['rightcenter', new Port()],
      ['bottomleft', new Port()],
      ['bottomcenter', new Port()],
      ['bottomright', new Port()],
    ]
  )

  constructor(container: SVGGElement) {
    this._container = container;

    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.setFillColor = this.setFillColor.bind(this);
    this.setStrokeWidth = this.setStrokeWidth.bind(this);
    this.setStrokeDasharray = this.setStrokeDasharray.bind(this);
    this.createVisual = this.createVisual.bind(this);

  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public ownsTarget(el: EventTarget): boolean {
    if (el === this.visual) {
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
      portLocations.forEach(pl => { 
        const port = this.ports.get(pl);
        if (port !== undefined) {
          port.enabled = false;
        }
      })
    }
  }

  public createVisual(): void {
    this.visual = SvgHelper.createRect(1, 1, [
      ['fill', this.fillColor],
      ['stroke', this.strokeColor],
      ['stroke-width', this.strokeWidth.toString()],
      ['stroke-dasharray', this.strokeDasharray]
    ]);
    this.addVisualToContainer(this.visual);
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

  public setSize(): void {
    this.moveVisual({x: this.left, y: this.top});
    SvgHelper.setAttributes(this.visual, [
      ['width', this.width.toString()],
      ['height', this.height.toString()],
    ]);
  } 

  protected setStrokeColor(color: string): void {
    this.strokeColor = color;
    if (this.visual) {
      SvgHelper.setAttributes(this.visual, [['stroke', this.strokeColor]]);
    }
  }
  protected setFillColor(color: string): void {
    this.fillColor = color;
    if (this.visual) {
      SvgHelper.setAttributes(this.visual, [['fill', this.fillColor]]);
    }
  }
  protected setStrokeWidth(width: number): void {
    this.strokeWidth = width;
    if (this.visual) {
      SvgHelper.setAttributes(this.visual, [['stroke-width', this.strokeWidth.toString()]]);
    }
  }
  protected setStrokeDasharray(dashes: string): void {
    this.strokeDasharray = dashes;
    if (this.visual) {
      SvgHelper.setAttributes(this.visual, [['stroke-dasharray', this.strokeDasharray]]);
    }
  }
}
