import { ConnectorBase } from './ConnectorBase';
import { DiagramSettings } from './DiagramSettings';
import { IPoint } from './IPoint';
import { Port } from './Port';
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';

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
      `M ${xPadding} ${yPadding} C ${
        (width - xPadding * 2) * 0.75
      } ${yPadding}, ${(width - xPadding * 2) * 0.25} ${height - yPadding}, ${
        width - xPadding
      } ${height - yPadding}`,
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

  private getPathD(): string {
    const [ending1, ending2] = this.getEndings();
    const MIN_SEGMENT_LENGTH = 10;
    type LineDirection = 'left' | 'up' | 'right' | 'down';

    let startLineDir: LineDirection = 'left';
    if (this.startPort !== undefined) {
      startLineDir = getEdgeLineDirection(this.startPort);
    }

    let endLineDir: LineDirection = 'left';
    if (this.endPort !== undefined) {
      endLineDir = getEdgeLineDirection(this.endPort);
    }

    const firstPoint = getEdgePoint(ending1, startLineDir);
    const lastPoint = getEdgePoint(ending2, endLineDir);

    const stepPoints: IPoint[] = [];

    let prevPoint = firstPoint;
    let nextPoint: IPoint = { x: prevPoint.x, y: lastPoint.y };

    if (this.startStencil !== undefined && this.endStencil !== undefined) {
      while (
        lineCrossesStencil(this.startStencil, prevPoint, nextPoint) ||
        lineCrossesStencil(this.startStencil, nextPoint, lastPoint) ||
        lineCrossesStencil(this.endStencil, prevPoint, nextPoint) ||
        lineCrossesStencil(this.endStencil, nextPoint, lastPoint)
      ) {
        if (stepPoints.length > 150) {
          // @todo - remove this temp breaker
          break;
        }

        if (
          lineCrossesStencilHorizontally(
            this.startStencil,
            prevPoint,
            nextPoint
          )
        ) {
          nextPoint.y = this.startStencil.bottom + MIN_SEGMENT_LENGTH;
          nextPoint.x = prevPoint.x;

          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });
          nextPoint = { x: nextPoint.x, y: lastPoint.y };
        } else if (
          lineCrossesStencilVertically(this.startStencil, prevPoint, nextPoint)
        ) {
          nextPoint.x = this.startStencil.right + MIN_SEGMENT_LENGTH;
          nextPoint.y = prevPoint.y;

          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });
          nextPoint = { x: nextPoint.x, y: lastPoint.y };
        } else if (
          lineCrossesStencilHorizontally(
            this.startStencil,
            nextPoint,
            lastPoint
          )
        ) {
          nextPoint.y = this.startStencil.bottom + MIN_SEGMENT_LENGTH;
          nextPoint.x = prevPoint.x;

          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });
          nextPoint = { x: lastPoint.x, y: nextPoint.y };
        } else if (
          lineCrossesStencilVertically(
            this.startStencil,
            nextPoint,
            lastPoint
          )
        ) {
          nextPoint.x = this.startStencil.right + MIN_SEGMENT_LENGTH;
          nextPoint.y = prevPoint.y;

          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });
          nextPoint = { x: nextPoint.x, y: lastPoint.y };
        } else if (
          lineCrossesStencilHorizontally(this.endStencil, nextPoint, lastPoint)
        ) {
          nextPoint.y = prevPoint.y;
          nextPoint.x =
            prevPoint.x > this.endStencil.right
              ? this.endStencil.right + MIN_SEGMENT_LENGTH
              : this.endStencil.left - MIN_SEGMENT_LENGTH;

          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });
          nextPoint = { x: nextPoint.x, y: lastPoint.y };
        } else if (
          lineCrossesStencilVertically(this.endStencil, nextPoint, lastPoint)
        ) {
          nextPoint.x = prevPoint.x;
          nextPoint.y =
            prevPoint.y > this.endStencil.bottom
              ? this.endStencil.bottom + MIN_SEGMENT_LENGTH
              : this.endStencil.top - MIN_SEGMENT_LENGTH;

          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });

          nextPoint.x = this.endStencil.right + MIN_SEGMENT_LENGTH;
          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });

          nextPoint = { x: nextPoint.x, y: lastPoint.y };
        } else if (
          lineCrossesStencilHorizontally(this.endStencil, prevPoint, nextPoint)
        ) {
          nextPoint.y = prevPoint.y;
          nextPoint.x =
            prevPoint.x > this.endStencil.right
              ? this.endStencil.right + MIN_SEGMENT_LENGTH
              : this.endStencil.left - MIN_SEGMENT_LENGTH;

          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });
          nextPoint = { x: nextPoint.x, y: lastPoint.y };
        } else if (
          lineCrossesStencilVertically(this.endStencil, prevPoint, nextPoint)
        ) {
          nextPoint.x = prevPoint.x;
          nextPoint.y =
            prevPoint.y > this.endStencil.bottom
              ? this.endStencil.bottom + MIN_SEGMENT_LENGTH
              : this.endStencil.top - MIN_SEGMENT_LENGTH;

          stepPoints.push({ x: nextPoint.x, y: nextPoint.y });
          nextPoint = { x: lastPoint.x, y: nextPoint.y };
        } else {
          console.log('unhandled routing');
          break;
        }

        prevPoint = stepPoints[stepPoints.length - 1];
      }

      stepPoints.push(nextPoint);
    }

    let result = `M ${ending1.x} ${ending1.y} L ${firstPoint.x} ${firstPoint.y} `;
    stepPoints.forEach((point) => {
      result += `L ${point.x} ${point.y} `;
    });
    result += `L ${lastPoint.x} ${lastPoint.y} L ${ending2.x} ${ending2.y}`;

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
    function getAngle(port?: Port, andgledCorners = true): number {
      let angle = 0;
      if (port !== undefined) {
        switch (port.location) {
          case 'bottomcenter': {
            angle = 0;
            break;
          }
          case 'bottomleft': {
            angle = andgledCorners ? 45 : 90;
            break;
          }
          case 'bottomright': {
            angle = andgledCorners ? -45 : 270;
            break;
          }
          case 'leftcenter': {
            angle = 90;
            break;
          }
          case 'rightcenter': {
            angle = 270;
            break;
          }
          case 'topcenter': {
            angle = 180;
            break;
          }
          case 'topleft': {
            angle = andgledCorners ? 135 : 90;
            break;
          }
          case 'topright': {
            angle = andgledCorners ? 225 : 270;
            break;
          }
        }
      }

      return angle;
    }

    super.rotateArrows();

    const a1transform = this.arrow1.transform.baseVal.getItem(0);
    a1transform.setRotate(getAngle(this.startPort, false), this.x1, this.y1);
    this.arrow1.transform.baseVal.replaceItem(a1transform, 0);

    const a2transform = this.arrow2.transform.baseVal.getItem(0);
    a2transform.setRotate(getAngle(this.endPort, false), this.x2, this.y2);
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
}
