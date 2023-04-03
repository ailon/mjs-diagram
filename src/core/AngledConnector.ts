import { ConnectorBase } from './ConnectorBase';
import { DiagramSettings } from './DiagramSettings';
import { IPoint } from './IPoint';
import { Port } from './Port';
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

    const point2: IPoint = { x: firstPoint.x, y: lastPoint.y };
    stepPoints.push(point2);
    if (this.startStencil !== undefined && this.endStencil !== undefined) {
      // check if need to go around stencils
      let pointAdjusted = false;
      if (
        (firstPoint.y > this.startStencil.bottom &&
          point2.y < this.startStencil.bottom) ||
        (firstPoint.y < this.startStencil.top &&
          point2.y > this.startStencil.top)
      ) {
        point2.y = firstPoint.y;
        if (
          lastPoint.x < this.startStencil.left - MIN_SEGMENT_LENGTH ||
          lastPoint.x > this.startStencil.right + MIN_SEGMENT_LENGTH
        ) {
          point2.x = lastPoint.x;
        } else if (lastPoint.x <= this.endStencil.left) {
          point2.x = this.startStencil.left - MIN_SEGMENT_LENGTH;
        } else {
          point2.x = this.startStencil.right + MIN_SEGMENT_LENGTH;
        }
        pointAdjusted = true;
      }

      if (pointAdjusted) {
        const point3: IPoint = { x: point2.x, y: lastPoint.y };
        stepPoints.push(point3);
      }
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
