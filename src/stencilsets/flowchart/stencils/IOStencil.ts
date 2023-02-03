import { SvgHelper, TextStencil } from "../../../viewer_index";

export class IOStencil extends TextStencil {
  public static typeName = 'IOStencil';

  public static title = 'Input/Output';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.textBoundingBox = new DOMRect();

    this.disablePorts('bottomleft', 'topleft', 'bottomright', 'topright');
  }

  public static getThumbnail(width: number, height: number): SVGSVGElement {

    const rectWidth = width * 0.9;
    const rectHeight = Math.min(height * 0.9, rectWidth * 0.4);

    const result = super.getThumbnailSVG(rectWidth, rectHeight);

    const rect = SvgHelper.createPolygon(`${rectWidth * 0.2} 0, ${rectWidth} 0, ${rectWidth * 0.8} ${rectHeight}, 0 ${rectHeight}`);

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
  
  public createVisual(): void {
    this._frame = SvgHelper.createPolygon(`1 0, 3 0, 2 2, 0 2`, [
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
    const rectWidth = this.width * 0.6;
    const rectHeight = this.height;

    this.textBoundingBox.x = (this.width - rectWidth) / 2 + this.padding;
    this.textBoundingBox.y = (this.height - rectHeight) / 2 + this.padding;
    this.textBoundingBox.width = rectWidth - this.padding * 2;
    this.textBoundingBox.height = rectHeight - this.padding * 2;
  }

  public setSize(): void {
    this.moveVisual({ x: this.left, y: this.top });
    SvgHelper.setAttributes(this._frame, [
      ['points', `${this.width * 0.2} 0, ${this.width} 0, ${this.width * 0.8} ${this.height}, 0 ${this.height}`]
    ]);
    this.setTextBoundingBox();
    this.positionText();
  }
}
