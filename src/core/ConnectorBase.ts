import { ConnectorBaseState, ConnectorEndPoints } from './ConnectorBaseState';
import { IPoint } from './IPoint';
import { Port } from './Port';
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';

export type ArrowType = 'both' | 'start' | 'end' | 'none';

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

  public visibleLine!: SVGLineElement | SVGPathElement;
  public selectorLine!: SVGLineElement | SVGPathElement;
  public strokeColor = '#000';
  public strokeWidth = 1;
  public strokeDasharray = '';

  public labelText = '';
  public textElement!: SVGTextElement;
  public textBoundingBox= new DOMRect();
  public labelBackground!: SVGRectElement
  public labelOffsetX = 0;
  public labelOffsetY = 0;

  protected arrow1!: SVGPolygonElement;
  protected arrow2!: SVGPolygonElement;

  public arrowType: ArrowType = 'none';

  protected arrowBaseHeight = 10;
  protected arrowBaseWidth = 10;  

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const result = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    result.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    result.setAttribute('width', width.toString());
    result.setAttribute('height', height.toString());
    result.setAttribute(
      'viewBox',
      '0 0 ' +
        width.toString() +
        ' ' +
        height.toString()
    );

    const xPadding = Math.max(Math.floor(width * 0.05), 2);
    const yPadding = Math.max(Math.floor(height * 0.05), 2);

    const line = SvgHelper.createLine(xPadding, yPadding, width - xPadding, height - xPadding,
      [['stroke-width', Math.max(Math.round(width / 20), 2).toString()]]
    );

    result.appendChild(line);

    return result;
  }
  
  constructor(iid: number, container: SVGGElement) {
    this._iid = iid;
    this.container = container;

    this.ownsTarget = this.ownsTarget.bind(this);
    this.labelOwnsTarget = this.labelOwnsTarget.bind(this);
    this.createVisual = this.createVisual.bind(this);
    this.createCoreVisual = this.createCoreVisual.bind(this);
    this.adjustVisual = this.adjustVisual.bind(this);
    this.addVisualToContainer = this.addVisualToContainer.bind(this);

    this.adjust = this.adjust.bind(this);
    this.adjustPoints = this.adjustPoints.bind(this);
    this.setStartPosition = this.setStartPosition.bind(this);
    this.setEndPosition = this.setEndPosition.bind(this);
    this.renderText = this.renderText.bind(this);
    this.setTextBoundingBox = this.setTextBoundingBox.bind(this);
    this.positionText = this.positionText.bind(this);
    this.moveLabel = this.moveLabel.bind(this);
    this.getArrowPoints = this.getArrowPoints.bind(this);
    this.createTips = this.createTips.bind(this);
    this.adjustTips = this.adjustTips.bind(this);
    this.rotateArrows = this.rotateArrows.bind(this);
    this.getEnding = this.getEnding.bind(this);
    this.getEndings = this.getEndings.bind(this);

    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.setArrowType = this.setArrowType.bind(this);

    this.scale = this.scale.bind(this);
    this.getState = this.getState.bind(this);
    this.restoreState = this.restoreState.bind(this);
  }

  public ownsTarget(el: EventTarget): boolean {
    if (
      el === this.visual ||
      el === this.selectorLine ||
      el === this.visibleLine ||
      el === this.textElement
    ) {
      return true;
    } else {
      return this.labelOwnsTarget(el);
    }
  }

  public labelOwnsTarget(el: EventTarget): boolean {
    let found = false;
    this.textElement.childNodes.forEach((span) => {
      if (span === el) {
        found = true;
      }
    });
    return found;
  }

  public createVisual() {
    this.createCoreVisual();

    this.createTips();

    this.labelBackground = SvgHelper.createRect(10, 10, [['fill', 'white']]);
    this.visual.appendChild(this.labelBackground);
    this.textElement = SvgHelper.createText();
    this.textElement.style.fontSize = '1rem';
    this.textElement.style.textAnchor = 'middle';
    this.textElement.style.dominantBaseline = 'hanging';
    this.visual.appendChild(this.textElement);

    this.renderText();

    this.addVisualToContainer(this.visual);
  }

  public createCoreVisual() {
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
  }

  public addVisualToContainer(element: SVGElement): void {
    if (this.container.childNodes.length > 0) {
      this.container.insertBefore(element, this.container.childNodes[0]);
    } else {
      this.container.appendChild(element);
    }
  }

  private getArrowPoints(offsetX: number, offsetY: number): string {
    const width = this.arrowBaseWidth + this.strokeWidth * 2;
    const height = this.arrowBaseHeight + this.strokeWidth * 2;
    return `${offsetX - width / 2},${
      offsetY + height - this.strokeWidth
    } ${offsetX},${offsetY - this.strokeWidth} ${
      offsetX + width / 2},${offsetY + height - this.strokeWidth}`;
  }

  private createTips() {
    this.arrow1 = SvgHelper.createPolygon(this.getArrowPoints(this.x1, this.y1), [['fill', this.strokeColor]]);
    this.arrow1.transform.baseVal.appendItem(SvgHelper.createTransform());
    this.visual.appendChild(this.arrow1);

    this.arrow2 = SvgHelper.createPolygon(this.getArrowPoints(this.x2, this.y2), [['fill', this.strokeColor]]);
    this.arrow2.transform.baseVal.appendItem(SvgHelper.createTransform());
    this.visual.appendChild(this.arrow2);
  }

  public adjust(): void {
    this.adjustPoints();
    this.adjustVisual();
  }

  public adjustPoints(): void {
    if (this.startStencil && this.startPort) {
      const start = this.startStencil.getPortPosition(this.startPort.location);
      this.x1 = start.x;
      this.y1 = start.y;
    }
    if (this.endStencil && this.endPort) {
      const end = this.endStencil.getPortPosition(this.endPort.location);

      this.x2 = end.x;
      this.y2 = end.y;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getEnding(baseEnding: IPoint, port?: Port): IPoint {
    const result: IPoint = { x: baseEnding.x, y: baseEnding.y };
    return result;
  }

  protected getEndings(): [IPoint, IPoint] {
    let ending1: IPoint = { x: this.x1, y: this.y1 };
    let ending2: IPoint = { x: this.x2, y: this.y2 };

    if (this.arrowType === 'both' || this.arrowType === 'start') {
      ending1 = this.getEnding(ending1, this.startPort);
    }
    if (this.arrowType === 'both' || this.arrowType === 'end') {
      ending2 = this.getEnding(ending2, this.endPort);
    }

    return [ending1, ending2];
  }

  public adjustVisual(): void {
    if (this.selectorLine && this.visibleLine) {
      const [ending1, ending2] = this.getEndings();

      this.selectorLine.setAttribute('x1', ending1.x.toString());
      this.selectorLine.setAttribute('y1', ending1.y.toString());
      this.selectorLine.setAttribute('x2', ending2.x.toString());
      this.selectorLine.setAttribute('y2', ending2.y.toString());

      this.visibleLine.setAttribute('x1', ending1.x.toString());
      this.visibleLine.setAttribute('y1', ending1.y.toString());
      this.visibleLine.setAttribute('x2', ending2.x.toString());
      this.visibleLine.setAttribute('y2', ending2.y.toString());

      SvgHelper.setAttributes(this.visibleLine, [['stroke', this.strokeColor]]);
      SvgHelper.setAttributes(this.visibleLine, [['stroke-width', this.strokeWidth.toString()]]);
      SvgHelper.setAttributes(this.visibleLine, [['stroke-dasharray', this.strokeDasharray.toString()]]);

      this.adjustTips();

      this.positionText();
    }
  }

  public adjustTips() {
    if (this.arrow1 && this.arrow2) {
      this.arrow1.style.display = (this.arrowType === 'both' || this.arrowType === 'start') && this.startPort !== undefined ? '' : 'none';
      this.arrow2.style.display = (this.arrowType === 'both' || this.arrowType === 'end') && this.endPort !== undefined ? '' : 'none';

      SvgHelper.setAttributes(this.arrow1, [
        ['points', this.getArrowPoints(this.x1, this.y1)],
        ['fill', this.strokeColor]
      ]);
      SvgHelper.setAttributes(this.arrow2, [
        ['points', this.getArrowPoints(this.x2, this.y2)],
        ['fill', this.strokeColor]
      ]);

      this.rotateArrows();
    }
  }

  protected rotateArrows() {
    if (Math.abs(this.x1 - this.x2) > 0.1) {
      const lineAngle1 = (Math.atan((this.y2 - this.y1) / (this.x2 - this.x1)) * 180) / Math.PI + 90 * Math.sign(this.x1 - this.x2);

      const a1transform = this.arrow1.transform.baseVal.getItem(0);
      a1transform.setRotate(lineAngle1, this.x1, this.y1);
      this.arrow1.transform.baseVal.replaceItem(a1transform, 0);

      const a2transform = this.arrow2.transform.baseVal.getItem(0);
      a2transform.setRotate(lineAngle1 + 180, this.x2, this.y2);
      this.arrow2.transform.baseVal.replaceItem(a2transform, 0);
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

  public renderText() {
    const LINE_SIZE = '1rem';

    if (this.textElement) {
      while (this.textElement.lastChild) {
        this.textElement.removeChild(this.textElement.lastChild);
      }

      const lines = this.labelText.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
      lines.forEach((line, lineno) => {
        this.textElement.appendChild(
          SvgHelper.createTSpan(
            // workaround for swallowed empty lines
            line.trim() === '' ? ' ' : line.trim(),
            [
              // ['x', '0'],
              ['dy', lineno > 0 ? LINE_SIZE : '0'],
            ]
          )
        );
      });

      setTimeout(this.positionText, 10);
    }
  }

  public moveLabel(offsetX: number, offsetY: number) {
    this.labelOffsetX += offsetX;
    this.labelOffsetY += offsetY;
    this.positionText();
  }

  protected setTextBoundingBox() {
    this.textBoundingBox.x = Math.min(this.x1, this.x2);
    this.textBoundingBox.y = Math.min(this.y1, this.y2);
    this.textBoundingBox.width = Math.max(this.x1, this.x2) - this.textBoundingBox.x;
    this.textBoundingBox.height = Math.max(this.y1, this.y2) - this.textBoundingBox.y;
  }

  public positionText() {
    this.setTextBoundingBox();
    const textBBox = this.textElement.getBBox();
    const centerX =
      this.textBoundingBox.x +
      this.textBoundingBox.width / 2 +
      this.labelOffsetX;
    const centerY =
      this.textBoundingBox.y +
      this.textBoundingBox.height / 2 - textBBox.height / 2 +
      this.labelOffsetY;

    this.textElement.childNodes.forEach((ts) => {
      const tspan = <SVGTSpanElement>ts;
      SvgHelper.setAttributes(tspan, [['x', `${centerX}`]]);
    });
    SvgHelper.setAttributes(this.textElement, [['x', `${centerX}`], ['y', `${centerY}`]]);

    const bgPadding = 1.2;
    SvgHelper.setAttributes(this.labelBackground, [
      ['width', (textBBox.width * bgPadding).toString()],
      ['height', (textBBox.height * bgPadding).toString()],
      ['x', (centerX - (textBBox.width * bgPadding / 2)).toString()],
      ['y', (centerY - (textBBox.height / 2) * (bgPadding - 1) * 2).toString()]
    ]);
  }  

  public setStrokeColor(color: string): void {
    this.strokeColor = color;
    this.adjustVisual();
  }

  public setArrowType(arrowType: ArrowType): void {
    this.arrowType = arrowType;
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

      labelOffsetX: this.labelOffsetX,
      labelOffsetY: this.labelOffsetY,

      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray,

      arrowType: this.arrowType,

      labelText: this.labelText
    }
  }

  public restoreState(state: ConnectorBaseState, endPoints: ConnectorEndPoints) {
    this._iid = state.iid;

    this.strokeColor = state.strokeColor;
    this.strokeWidth = state.strokeWidth;
    this.strokeDasharray = state.strokeDasharray;

    this.labelOffsetX = state.labelOffsetX;
    this.labelOffsetY = state.labelOffsetY;

    this.startStencil = endPoints.startStencil;
    this.startPort = endPoints.startPort;
    this.endStencil = endPoints.endStencil;
    this.endPort = endPoints.endPort;

    this.arrowType = state.arrowType ?? 'none';

    this.labelText = state.labelText ?? '';

    this.createVisual();
    this.adjustPoints();
    this.adjustVisual();
  }

}