import { SvgHelper, TextStencil } from "../../../viewer_index";

export class TerminalStencil extends TextStencil {
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

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const rectWidth = width * 0.9;
    const rectHeight = Math.min(height * 0.9, rectWidth * 0.4);

    const result = super.getThumbnailSVG(rectWidth, rectHeight);

    const rect = SvgHelper.createPath(this.getPathD(rectWidth, rectHeight));

    result.appendChild(rect);

    const fontSize = Math.max(height * 0.1, 10);

    const text = SvgHelper.createText([
      ['x', (rectWidth / 2).toString()],
      ['y', (rectHeight / 2 - fontSize / 2).toString()],
      ['width', rectWidth.toString()],
    ]);
    text.style.fontFamily = 'Arial, Helvetica, sans-serif';
    text.style.fontSize = `${fontSize}px`;
    text.style.textAnchor = 'middle';
    text.style.dominantBaseline = 'hanging';
    text.style.strokeWidth = '0px';
    text.style.fill = 'currentColor';
    text.textContent = 'Text';

    result.appendChild(text);

    return result;
  }



  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.getPathD = this.getPathD.bind(this);

    this.textBoundingBox = new DOMRect();

    this.disablePorts('bottomleft', 'topleft', 'bottomright', 'topright');
  }

  protected getPathD(width: number, height: number): string {
    return Object.getPrototypeOf(this).constructor.getPathD(width, height);
  }
  
  public createVisual(): void {
    this._frame = SvgHelper.createPath(this.getPathD(10, 10), [
      ['fill', this.fillColor],
      ['stroke', this.strokeColor],
      ['stroke-width', this.strokeWidth.toString()],
      ['stroke-dasharray', this.strokeDasharray],
    ]);
    this.visual.appendChild(this._frame);
    this.addVisualToContainer(this.visual);

    this.createTextElement();
  }

  protected setTextBoundingBox() {
    const rectWidth = this.width - this.height;
    const rectHeight = this.height;

    this.textBoundingBox.x = (this.width - rectWidth) / 2 + this.padding;
    this.textBoundingBox.y = (this.height - rectHeight) / 2 + this.padding;
    this.textBoundingBox.width = rectWidth - this.padding * 2;
    this.textBoundingBox.height = rectHeight - this.padding * 2;
  }

  public setSize(): void {
    this.moveVisual({ x: this.left, y: this.top });
    SvgHelper.setAttributes(this._frame, [
      ['d', this.getPathD(this.width, this.height)]
    ]);
    this.setTextBoundingBox();
    this.positionText();
  }
}
