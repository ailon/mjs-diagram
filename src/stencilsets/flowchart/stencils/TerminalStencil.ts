import { RectangleTextStencil } from "../../../core/RectangleTextStencil";

export class TerminalStencil extends RectangleTextStencil {
  public static typeName = 'TerminalStencil';

  public static title = 'Terminal';

  protected static getPathD(width: number, height: number): string {
    const result = `
      M ${height / 2} 0 
      H ${width - height / 2} 
      A ${height / 2} ${height / 2} 0 1 1 ${width - height / 2} ${height}
      H ${height / 2}
      A ${height / 2} ${height / 2} 0 0 1 ${height / 2} ${0}
    `
    return result;
  }

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.getPathD = this.getPathD.bind(this);

    this.textBoundingBox = new DOMRect();

    this.defaultSize = { width: 150, height: 50 };

    this.disablePorts('bottomleft', 'topleft', 'bottomright', 'topright');
  }

  protected setTextBoundingBox() {
    super.setTextBoundingBox();

    const rectWidth = this.width - this.height;
    const rectHeight = this.height;

    this.textBoundingBox.x = (this.width - rectWidth) / 2 + this.padding;
    this.textBoundingBox.y = (this.height - rectHeight) / 2 + this.padding;
    this.textBoundingBox.width = rectWidth - this.padding * 2;
    this.textBoundingBox.height = rectHeight - this.padding * 2;
  }
}
