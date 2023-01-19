import { ConnectorBase } from './ConnectorBase';
import { SvgHelper } from './SvgHelper';

export class CurvedConnector extends ConnectorBase {
  public static typeName = 'CurvedConnector';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.getPathD = this.getPathD.bind(this);
    // this.createCoreVisual = this.createCoreVisual.bind(this);
  }

  private getPathD(): string {
    const width = this.x2 - this.x1,
      height = this.y2 - this.y1;

    const cxOffset = Math.max(Math.abs(width / 4), 50);
    const cyOffset = Math.max(Math.abs(height / 4), 50);

    let cx1 = this.x1,
      cy1 = this.y1,
      //   cx2 = this.x1 + width / 2,
      //   cy2 = this.y1 + height / 2,
      cx4 = this.x2,
      cy4 = this.y2;

    if (this.startPort !== undefined) {
      switch (this.startPort.location) {
        case 'bottomcenter': {
          cy1 = this.y1 + cyOffset;
          break;
        }
        case 'bottomleft': {
          cx1 = this.x1 - cxOffset;
          cy1 = this.y1 + cyOffset;
          break;
        }
        case 'bottomright': {
          cx1 = this.x1 + cxOffset;
          cy1 = this.y1 + cyOffset;
          break;
        }
        case 'leftcenter': {
          cx1 = this.x1 - cxOffset;
          break;
        }
        case 'rightcenter': {
          cx1 = this.x1 + cxOffset;
          break;
        }
        case 'topcenter': {
          cy1 = this.y1 - cyOffset;
          break;
        }
        case 'topleft': {
          cx1 = this.x1 - cxOffset;
          cy1 = this.y1 - cyOffset;
          break;
        }
        case 'topright': {
          cx1 = this.x1 + cxOffset;
          cy1 = this.y1 - cyOffset;
          break;
        }
      }
    }

    if (this.endPort !== undefined) {
      switch (this.endPort.location) {
        case 'bottomcenter': {
          cy4 = this.y2 + cyOffset;
          break;
        }
        case 'bottomleft': {
          cx4 = this.x2 - cxOffset;
          cy4 = this.y2 + cyOffset;
          break;
        }
        case 'bottomright': {
          cx4 = this.x2 + cxOffset;
          cy4 = this.y2 + cyOffset;
          break;
        }
        case 'leftcenter': {
          cx4 = this.x2 - cxOffset;
          break;
        }
        case 'rightcenter': {
          cx4 = this.x2 + cxOffset;
          break;
        }
        case 'topcenter': {
          cy4 = this.y2 - cyOffset;
          break;
        }
        case 'topleft': {
          cx4 = this.x2 - cxOffset;
          cy4 = this.y2 - cyOffset;
          break;
        }
        case 'topright': {
          cx4 = this.x2 + cxOffset;
          cy4 = this.y2 - cyOffset;
          break;
        }
      }
    }

    // const result = `M ${this.x1} ${this.y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${
    //   this.x1 + width / 2
    // } ${this.y1 + height / 2} S ${cx4} ${cy4}, ${this.x2} ${this.y2}`;
    const result = `M ${this.x1} ${this.y1} C ${cx1} ${cy1}, ${cx4} ${cy4}, ${this.x2} ${this.y2}`;

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
