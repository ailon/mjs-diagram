import { SvgHelper } from './SvgHelper';
import { TextStencil } from './TextStencil';

export class EllipseStencil extends TextStencil {
  public static typeName = 'EllipseStencil';

  public static title = 'Ellipse stencil';

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

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const result = super.getThumbnailSVG(width, height);

    const rectWidth = width * 0.9;
    const rectHeight = Math.min(height * 0.9, rectWidth * 0.75);

    const rect = SvgHelper.createEllipse(rectWidth, rectHeight, [
      ['cx', (width / 2).toString()],
      ['cy', (height / 2).toString()]
    ]);

    result.appendChild(rect);

    const fontSize = Math.max(height * 0.1, 10);

    const text = SvgHelper.createText([
      ['x', (width / 2).toString()],
      ['y', (height / 2 - fontSize / 2).toString()],
      ['width', width.toString()],
    ]);
    text.style.fontFamily = 'Arial, Helvetica, sans-serif';
    text.style.fontSize = `${fontSize}px`;
    text.style.textAnchor = 'middle';
    text.style.dominantBaseline = 'hanging';
    text.style.strokeWidth = '0px';
    text.style.fill = 'currentColor';
    text.textContent = 'Ellipse';

    result.appendChild(text);

    return result;
  }
  
  public createVisual(): void {
    this._frame = SvgHelper.createEllipse(1, 1, [
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
    const rectWidth = this.width / 2 * Math.sqrt(2);
    const rectHeight = this.height / 2 * Math.sqrt(2);

    this.textBoundingBox.x = (this.width - rectWidth) / 2 + this.padding;
    this.textBoundingBox.y = (this.height - rectHeight) / 2 + this.padding;
    this.textBoundingBox.width = rectWidth - this.padding * 2;
    this.textBoundingBox.height = rectHeight - this.padding * 2;
  }

  public setSize(): void {
    this.moveVisual({ x: this.left, y: this.top });
    SvgHelper.setAttributes(this._frame, [
      ['cx', (this.width / 2).toString()],
      ['cy', (this.height / 2).toString()],
      ['rx', (this.width / 2).toString()],
      ['ry', (this.height / 2).toString()],
    ]);
    this.setTextBoundingBox();
    this.positionText();
  }
}
