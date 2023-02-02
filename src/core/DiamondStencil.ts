import { SvgHelper } from './SvgHelper';
import { TextStencil } from './TextStencil';
import { TextStencilState } from './TextStencilState';

export class DiamondStencil extends TextStencil {
  public static typeName = 'DiamondStencil';

  public static title = 'Diamond stencil';

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
    const offsetX = (width - rectWidth)/2
    const offsetY = (height - rectHeight)/2

    const rect = SvgHelper.createPolygon(`${offsetX + rectWidth / 2} ${offsetY}, ${offsetX + rectWidth} ${offsetY + rectHeight / 2}, ${offsetX + rectWidth / 2} ${offsetY + rectHeight}, ${offsetX} ${offsetY + rectHeight / 2}`);

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
    text.textContent = 'Diamond';

    result.appendChild(text);

    return result;
  }
  
  public createVisual(): void {
    this._frame = SvgHelper.createPolygon(`1 0, 2 1, 1 2, 0 1`, [
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
    const angle = Math.atan(this.width !== 0 ? (this.height / 2) / (this.width / 2) : 1);
    const side = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));

    const rectWidth = Math.cos(angle) * side;
    const rectHeight = Math.sin(angle) * side;

    this.textBoundingBox.x = (this.width - rectWidth) / 2 + this.padding;
    this.textBoundingBox.y = (this.height - rectHeight) / 2 + this.padding;
    this.textBoundingBox.width = rectWidth - this.padding * 2;
    this.textBoundingBox.height = rectHeight - this.padding * 2;
  }

  public setSize(): void {
    this.moveVisual({ x: this.left, y: this.top });
    SvgHelper.setAttributes(this._frame, [
      ['points', `${this.width / 2} 0, ${this.width} ${this.height / 2}, ${this.width / 2} ${this.height}, 0 ${this.height / 2}`]
    ]);
    this.setTextBoundingBox();
    this.positionText();
  }
}
