import { ConnectorBase } from './ConnectorBase';
import { DiagramSettings } from './DiagramSettings';
import { IPoint } from './IPoint';
import { Port } from './Port';
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';

type LineDirection = 'left' | 'up' | 'right' | 'down';

export class AngledConnector extends ConnectorBase {
  public static typeName = 'AngledConnector';

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
      '0 0 ' + width.toString() + ' ' + height.toString()
    );

    const xPadding = Math.max(Math.floor(width * 0.05), 2);
    const yPadding = Math.max(Math.floor(height * 0.05), 2);

    const line = SvgHelper.createPath(
      `M ${xPadding} ${yPadding} H ${width / 2} V ${height - yPadding}, H ${
        width - xPadding
      }`,
      [
        ['stroke-width', Math.max(Math.round(width / 20), 2).toString()],
        ['fill', 'transparent'],
      ]
    );

    result.appendChild(line);

    return result;
  }

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.getPathD = this.getPathD.bind(this);
  }

  private startLineDir: LineDirection = 'left';
  private endLineDir: LineDirection = 'left';

  private stepPoints: IPoint[] = [];

  private getPathD(): string {
    const [ending1, ending2] = this.getEndings();
    const MIN_SEGMENT_LENGTH = 10;

    if (this.startPort !== undefined) {
      this.startLineDir = getEdgeLineDirection(this.startPort);
    }

    if (this.endPort !== undefined) {
      this.endLineDir = getEdgeLineDirection(this.endPort);
    }

    const firstPoint =
      this.startStencil !== undefined
        ? getEdgePoint(ending1, this.startLineDir)
        : ending1;
    const lastPoint =
      this.endStencil !== undefined
        ? getEdgePoint(ending2, this.endLineDir)
        : ending2;

    this.stepPoints = [
      firstPoint,
      {
        x:
          this.startLineDir === 'left' || this.startLineDir === 'right'
            ? lastPoint.x
            : firstPoint.x,
        y:
          this.startLineDir === 'left' || this.startLineDir === 'right'
            ? firstPoint.y
            : lastPoint.y,
      },
      lastPoint,
    ];

    let result = `M ${ending1.x} ${ending1.y} `;
    this.stepPoints.forEach((point) => {
      result += `L ${point.x} ${point.y} `;
    });
    result += `L ${ending2.x} ${ending2.y}`;

    return result;

    function getEdgePoint(basePoint: IPoint, direction: LineDirection): IPoint {
      const point: IPoint = { x: basePoint.x, y: basePoint.y };
      switch (direction) {
        case 'down': {
          point.y += MIN_SEGMENT_LENGTH;
          break;
        }
        case 'up': {
          point.y -= MIN_SEGMENT_LENGTH;
          break;
        }
        case 'left': {
          point.x -= MIN_SEGMENT_LENGTH;
          break;
        }
        case 'right': {
          point.x += MIN_SEGMENT_LENGTH;
          break;
        }
      }
      return point;
    }

    function getEdgeLineDirection(port: Port): LineDirection {
      let direction: LineDirection = 'left';
      switch (port.location) {
        case 'bottomcenter': {
          direction = 'down';
          break;
        }
        case 'leftcenter': {
          direction = 'left';
          break;
        }
        case 'topcenter': {
          direction = 'up';
          break;
        }
        case 'rightcenter': {
          direction = 'right';
          break;
        }
        // @todo
        case 'bottomleft': {
          direction = 'down';
          break;
        }
        case 'bottomright': {
          direction = 'down';
          break;
        }
        case 'topleft': {
          direction = 'up';
          break;
        }
        case 'topright': {
          direction = 'up';
          break;
        }
        default:
          break;
      }
      return direction;
    }

    function lineCrossesStencilHorizontally(
      stencil: StencilBase,
      point1: IPoint,
      point2: IPoint
    ): boolean {
      const leftPoint = point1.x > point2.x ? point2 : point1;
      const rightPoint = leftPoint === point1 ? point2 : point1;

      return (
        leftPoint.x <= stencil.right &&
        rightPoint.x >= stencil.left &&
        leftPoint.y >= stencil.top &&
        leftPoint.y <= stencil.bottom
      );
    }

    function lineCrossesStencilVertically(
      stencil: StencilBase,
      point1: IPoint,
      point2: IPoint
    ): boolean {
      const topPoint = point1.y > point2.y ? point2 : point1;
      const bottomPoint = topPoint === point1 ? point2 : point1;

      return (
        topPoint.y <= stencil.bottom &&
        bottomPoint.y >= stencil.top &&
        topPoint.x >= stencil.left &&
        topPoint.x <= stencil.right
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function lineCrossesStencil(
      stencil: StencilBase,
      point1: IPoint,
      point2: IPoint
    ): boolean {
      return (
        lineCrossesStencilHorizontally(stencil, point1, point2) ||
        lineCrossesStencilVertically(stencil, point1, point2)
      );
    }
  }

  protected rotateArrows(): void {
    function getAngle(direction: LineDirection): number {
      let angle = 0;
      switch (direction) {
        case 'left': {
          angle = 90;
          break;
        }
        case 'right': {
          angle = 270;
          break;
        }
        case 'up': {
          angle = 180;
          break;
        }
        case 'down': {
          angle = 0;
          break;
        }
      }

      return angle;
    }

    super.rotateArrows();

    const a1transform = this.arrow1.transform.baseVal.getItem(0);
    a1transform.setRotate(getAngle(this.startLineDir), this.x1, this.y1);
    this.arrow1.transform.baseVal.replaceItem(a1transform, 0);

    const a2transform = this.arrow2.transform.baseVal.getItem(0);
    a2transform.setRotate(getAngle(this.endLineDir), this.x2, this.y2);
    this.arrow2.transform.baseVal.replaceItem(a2transform, 0);
  }

  protected getEnding(baseEnding: IPoint, port?: Port): IPoint {
    const result: IPoint = { x: baseEnding.x, y: baseEnding.y };
    const offset = this.arrowBaseHeight / 1.5;
    if (port !== undefined) {
      switch (port.location) {
        case 'bottomcenter': {
          result.y += offset;
          break;
        }
        case 'bottomleft': {
          result.x -= offset;
          result.y += offset;
          break;
        }
        case 'bottomright': {
          result.x += offset;
          result.y += offset;
          break;
        }
        case 'leftcenter': {
          result.x -= offset;
          break;
        }
        case 'rightcenter': {
          result.x += offset;
          break;
        }
        case 'topcenter': {
          result.y -= offset;
          break;
        }
        case 'topleft': {
          result.x -= offset;
          result.y -= offset;
          break;
        }
        case 'topright': {
          result.x += offset;
          result.y -= offset;
          break;
        }
      }
    }

    return result;
  }

  public createCoreVisual(): void {
    this.selectorLine = SvgHelper.createPath(this.getPathD(), [
      ['stroke', 'transparent'],
      ['stroke-width', (this.strokeWidth + 10).toString()],
      ['fill', 'transparent'],
    ]);
    this.visibleLine = SvgHelper.createPath(this.getPathD(), [
      ['stroke', this.strokeColor],
      ['stroke-width', this.strokeWidth.toString()],
      ['fill', 'transparent'],
    ]);
    this.visual.appendChild(this.selectorLine);
    this.visual.appendChild(this.visibleLine);
  }

  public adjustVisual(): void {
    if (this.selectorLine && this.visibleLine) {
      this.selectorLine.setAttribute('d', this.getPathD());
      this.visibleLine.setAttribute('d', this.getPathD());

      SvgHelper.setAttributes(this.visibleLine, [['stroke', this.strokeColor]]);
      SvgHelper.setAttributes(this.visibleLine, [
        ['stroke-width', this.strokeWidth.toString()],
      ]);
      SvgHelper.setAttributes(this.visibleLine, [
        ['stroke-dasharray', this.strokeDasharray.toString()],
      ]);

      this.adjustTips();

      this.setTextBoundingBox();
    }
  }

  protected setTextBoundingBox(): void {
    const BASE_HEIGHT = 20;
    const BASE_WIDTH = 200;
    if (this.stepPoints.length > 1) {
      const [p1, p2] = [this.stepPoints[0], this.stepPoints[1]];

      if (p1.x != p2.x) {
        this.textBoundingBox.x = Math.min(p1.x, p2.x);
        this.textBoundingBox.y = p1.y - BASE_HEIGHT;
        this.textBoundingBox.width = Math.abs(p1.x - p2.x);
        this.textBoundingBox.height = BASE_HEIGHT;
      } else {
        this.textBoundingBox.x = p1.x - BASE_WIDTH / 2;
        this.textBoundingBox.y =
          Math.min(p1.y, p2.y) + Math.abs(p1.y - p2.y) / 2 - BASE_HEIGHT;
        this.textBoundingBox.width = BASE_WIDTH;
        this.textBoundingBox.height = BASE_HEIGHT;
      }
      this.textBlock.boundingBox = this.textBoundingBox;
    } else {
      super.setTextBoundingBox();
    }
  }
}
