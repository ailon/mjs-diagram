import { TextStencil } from './TextStencil';

export class DiamondStencil extends TextStencil {
  public static typeName = 'DiamondStencil';

  public static title = 'Diamond stencil';

  protected static getPathD(width: number, height: number): string {
    const result = `M0,${height/2} L${width / 2},0 L${width},${height/2} L${width / 2},${height} Z`;
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
    const angle = Math.atan(this.width !== 0 ? (this.height / 2) / (this.width / 2) : 1);
    const side = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));

    const rectWidth = Math.cos(angle) * side;
    const rectHeight = Math.sin(angle) * side;

    this.textBoundingBox.x = (this.width - rectWidth) / 2 + this.padding;
    this.textBoundingBox.y = (this.height - rectHeight) / 2 + this.padding;
    this.textBoundingBox.width = rectWidth - this.padding * 2;
    this.textBoundingBox.height = rectHeight - this.padding * 2;
  }
}
