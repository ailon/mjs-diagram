import { FontSize } from '../editor/EditorSettings';
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';
import { TextBlock } from './TextBlock';
import { TextStencilState } from './TextStencilState';

export class TextStencil extends StencilBase {
  public static typeName = 'TextStencil';

  public static title = 'Text stencil';

  private _color = 'transparent';
  public get color() {
    return this._color;
  }
  public set color(value) {
    this._color = value;
    this.textBlock.color = value;
  }

  private _fontFamily = 'Helvetica, Arial, sans-serif';
  public get fontFamily() {
    return this._fontFamily;
  }
  public set fontFamily(value) {
    this._fontFamily = value;
    this.textBlock.fontFamily = value;
  }

  private _fontSize: FontSize = {
    value: 1,
    units: 'rem',
    step: 0.1
  };
  public get fontSize(): FontSize {
    return this._fontSize;
  }
  public set fontSize(value: FontSize) {
    this._fontSize = value;
    this.textBlock.fontSize = value;
  }

  private readonly DEFAULT_TEXT = 'Text';
  private _text: string = this.DEFAULT_TEXT;
  public get text(): string {
    return this.textBlock.text;
  }
  public set text(value: string) {
    this._text = value;
    this.textBlock.text = this._text;
  }


  protected padding = 5;

  public textBoundingBox: DOMRect;

  //public textElement!: SVGTextElement;
  public textBlock: TextBlock = new TextBlock(this.DEFAULT_TEXT);

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.setColor = this.setColor.bind(this);
    this.setFont = this.setFont.bind(this);
    this.setFontSize = this.setFontSize.bind(this);
    this.addTextElement = this.addTextElement.bind(this);
    this.setSize = this.setSize.bind(this);

    this.textBoundingBox = new DOMRect();
  }

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const rectWidth = width * 0.9;
    const rectHeight = Math.min(height * 0.9, rectWidth * 0.4);

    const result = super.getThumbnail(rectWidth, rectHeight);

    const fontSize = Math.max(rectHeight * 0.1, 10);

    const text = SvgHelper.createText([
      ['x', (rectWidth/2).toString()],
      ['y', (rectHeight/2 - fontSize/2).toString()],
      ['width', rectWidth.toString()]
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

  public ownsTarget(el: EventTarget): boolean {
    return (super.ownsTarget(el) || el === this.visual || this.textBlock.ownsTarget(el));
  }

  protected addTextElement() {
    this.visual.appendChild(this.textBlock.textElement);
  }

  public createVisual(): void {
    super.createVisual();
    this.addTextElement();
  }

  protected setTextBoundingBox() {
    this.textBoundingBox.x = this.padding;
    this.textBoundingBox.y = this.padding;
    this.textBoundingBox.width = this.width - this.padding * 2;
    this.textBoundingBox.height = this.height - this.padding * 2;
    this.textBlock.boundingBox = this.textBoundingBox;
  }

  public setSize(): void {
    super.setSize();
    this.setTextBoundingBox();
  }

  public setColor(color: string): void {
    this.color = color;
  }

  public setFont(font: string): void {
    this.fontFamily = font;
  }

  public setFontSize(fontSize: FontSize): void {
    this.fontSize = fontSize;
  }

  public getState(): TextStencilState {
    const result: TextStencilState = Object.assign(
      {
        color: this._color,
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        padding: this.padding,
        text: this.text,
      },
      super.getState()
    );

    return result;
  }

  public restoreState(state: TextStencilState): void {
    const textState = state as TextStencilState;
    if (textState.color !== undefined) {
      this.color = textState.color;
    }
    if (textState.fontFamily !== undefined) {
      this.fontFamily = textState.fontFamily;
    }
    if (textState.fontSize !== undefined) {
      this.fontSize = textState.fontSize;
    }
    if (textState.padding !== undefined) {
      this.padding = textState.padding;
    }
    if (textState.text !== undefined) {
      this.text = textState.text;
    }

    super.restoreState(state);
  }

  public scale(scaleX: number, scaleY: number): void {
    super.scale(scaleX, scaleY);

    this.setSize();
  }
}
