import { SvgHelper } from "../../../core/SvgHelper";
import { TextStencil } from "../../../core/TextStencil";

export class ItemStencil extends TextStencil {
  public static typeName = 'ItemStencil';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const modHeight = width / 5;
    const result = super.getThumbnailSVG(width, modHeight);

    const rectWidth = width * 0.9;
    const rectHeight = Math.min(modHeight * 0.9, rectWidth * 0.75);
    const offsetX = (width - rectWidth)/2
    const offsetY = (modHeight - rectHeight)/2

    const rect = SvgHelper.createLine(offsetX, offsetY + rectHeight, offsetX + rectWidth, offsetY + rectHeight);

    result.appendChild(rect);

    const fontSize = Math.max(height * 0.1, 10);

    const text = SvgHelper.createText([
      ['x', (width / 2).toString()],
      ['y', (modHeight / 2 - fontSize / 2).toString()],
      ['width', width.toString()],
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
    this.disablePorts('topleft', 'topcenter', 'topright', 'leftcenter', 'rightcenter', 'bottomcenter');
  }

  private _selectorVisual!: SVGRectElement;
  public createVisual(): void {
    this._selectorVisual = SvgHelper.createRect(1, 1, [
      ['fill', 'transparent'],
      ['stroke', 'transparent'],
      ['stroke-width', '0']
    ]);
    this.visual.appendChild(this._selectorVisual);

    this._frame = SvgHelper.createLine(0, 1, 1, 1, [
      ['stroke', this.strokeColor],
      ['stroke-width', this.strokeWidth.toString()],
      ['stroke-dasharray', this.strokeDasharray],
    ]);
    this.visual.appendChild(this._frame);
    this.addVisualToContainer(this.visual);

    this.createTextElement();
  }

  public ownsTarget(el: EventTarget): boolean {
    if (super.ownsTarget(el) || el === this._selectorVisual) {
      return true;
    } else {
      return false;
    }
  }

  public setSize(): void {
    this.moveVisual({ x: this.left, y: this.top });
    SvgHelper.setAttributes(this._selectorVisual, [
      ['width', this.width.toString()],
      ['height', this.height.toString()],
    ]);
    SvgHelper.setAttributes(this._frame, [
      ['x1', '0'],
      ['y1', `${this.height}`],
      ['x2', `${this.width}`],
      ['y2', `${this.height}`],
    ]);
    this.setTextBoundingBox();
    this.positionText();
  }
}
