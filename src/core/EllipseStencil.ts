import { TextStencil } from './TextStencil';

export class EllipseStencil extends TextStencil {
  public static typeName = 'EllipseStencil';

  public static title = 'Ellipse stencil';

  protected static getPathD(width: number, height: number): string {
    const result = `M0,${height/2} a${width / 2},${height / 2} 0 1,0 ${width},0 a${width / 2},${height / 2} 0 1,0 -${width},0`;
    return result;
  }

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.setColor = this.setColor.bind(this);
    this.setFont = this.setFont.bind(this);
    this.renderText = this.renderText.bind(this);
    this.setSize = this.setSize.bind(this);
    this.positionText = this.positionText.bind(this);

    this.textBoundingBox = new DOMRect();

    this.disablePorts('bottomleft', 'topleft', 'bottomright', 'topright');
  }

  protected setTextBoundingBox() {
    const rectWidth = this.width / 2 * Math.sqrt(2);
    const rectHeight = this.height / 2 * Math.sqrt(2);

    this.textBoundingBox.x = (this.width - rectWidth) / 2 + this.padding;
    this.textBoundingBox.y = (this.height - rectHeight) / 2 + this.padding;
    this.textBoundingBox.width = rectWidth - this.padding * 2;
    this.textBoundingBox.height = rectHeight - this.padding * 2;
  }
}
