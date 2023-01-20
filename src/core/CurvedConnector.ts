import { ConnectorBase } from './ConnectorBase';
import { IPoint } from './IPoint';
import { Port } from './Port';
import { SvgHelper } from './SvgHelper';

export class CurvedConnector extends ConnectorBase {
  public static typeName = 'CurvedConnector';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.getPathD = this.getPathD.bind(this);
    // this.createCoreVisual = this.createCoreVisual.bind(this);
  }

  private getPathD(): string {
    const [ending1, ending2] = this.getEndings();

    const width = ending2.x - ending1.x,
      height = ending2.y - ending1.y;

    const cxOffset = Math.max(Math.abs(width / 4), 50);
    const cyOffset = Math.max(Math.abs(height / 4), 50);

    let cx1 = ending1.x,
      cy1 = ending1.y,
      //   cx2 = ending1.x + width / 2,
      //   cy2 = ending1.y + height / 2,
      cx4 = ending2.x,
      cy4 = ending2.y;

    if (this.startPort !== undefined) {
      switch (this.startPort.location) {
        case 'bottomcenter': {
          cy1 = ending1.y + cyOffset;
          break;
        }
        case 'bottomleft': {
          cx1 = ending1.x - cxOffset;
          cy1 = ending1.y + cyOffset;
          break;
        }
        case 'bottomright': {
          cx1 = ending1.x + cxOffset;
          cy1 = ending1.y + cyOffset;
          break;
        }
        case 'leftcenter': {
          cx1 = ending1.x - cxOffset;
          break;
        }
        case 'rightcenter': {
          cx1 = ending1.x + cxOffset;
          break;
        }
        case 'topcenter': {
          cy1 = ending1.y - cyOffset;
          break;
        }
        case 'topleft': {
          cx1 = ending1.x - cxOffset;
          cy1 = ending1.y - cyOffset;
          break;
        }
        case 'topright': {
          cx1 = ending1.x + cxOffset;
          cy1 = ending1.y - cyOffset;
          break;
        }
      }
    }

    if (this.endPort !== undefined) {
      switch (this.endPort.location) {
        case 'bottomcenter': {
          cy4 = ending2.y + cyOffset;
          break;
        }
        case 'bottomleft': {
          cx4 = ending2.x - cxOffset;
          cy4 = ending2.y + cyOffset;
          break;
        }
        case 'bottomright': {
          cx4 = ending2.x + cxOffset;
          cy4 = ending2.y + cyOffset;
          break;
        }
        case 'leftcenter': {
          cx4 = ending2.x - cxOffset;
          break;
        }
        case 'rightcenter': {
          cx4 = ending2.x + cxOffset;
          break;
        }
        case 'topcenter': {
          cy4 = ending2.y - cyOffset;
          break;
        }
        case 'topleft': {
          cx4 = ending2.x - cxOffset;
          cy4 = ending2.y - cyOffset;
          break;
        }
        case 'topright': {
          cx4 = ending2.x + cxOffset;
          cy4 = ending2.y - cyOffset;
          break;
        }
      }
    }

    // const result = `M ${ending1.x} ${ending1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${
    //   ending1.x + width / 2
    // } ${ending1.y + height / 2} S ${cx4} ${cy4}, ${ending2.x} ${ending2.y}`;
    const result = `M ${ending1.x} ${ending1.y} C ${cx1} ${cy1}, ${cx4} ${cy4}, ${ending2.x} ${ending2.y}`;

    return result;
  }

  protected rotateArrows(): void {
    function getAngle(port?: Port): number {
      let angle = 0;
      if (port !== undefined) {
        switch (port.location) {
          case 'bottomcenter': {
            angle = 0;
            break;
          }
          case 'bottomleft': {
            angle = 45;
            break;
          }
          case 'bottomright': {
            angle = -45;
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
            angle = 135;
            break;
          }
          case 'topright': {
            angle = 225;
            break;
          }
        }
      }

      return angle;
    }

    super.rotateArrows();

    const a1transform = this.arrow1.transform.baseVal.getItem(0);
    a1transform.setRotate(getAngle(this.startPort), this.x1, this.y1);
    this.arrow1.transform.baseVal.replaceItem(a1transform, 0);

    const a2transform = this.arrow2.transform.baseVal.getItem(0);
    a2transform.setRotate(getAngle(this.endPort), this.x2, this.y2);
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

      this.positionText();
    }
  }
}
