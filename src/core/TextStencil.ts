import { DiagramSettings } from "./DiagramSettings";
import { FontSize } from "./FontSize";
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';
import { TextBlock } from './TextBlock';
import { TextStencilState } from './TextStencilState';

/**
 * TextStencil is the base type for all stencils with text in them.
 */
export class TextStencil extends StencilBase {
  public static typeName = 'TextStencil';

  public static title = 'Text stencil';

  /**
   * Default text for the newly created stencil.
   */
  protected static DEFAULT_TEXT = 'Text';

  private _color = 'transparent';
  /**
   * Returns stencil's text color.
   */
  public get color() {
    return this._color;
  }
  /**
   * Sets the stencil's text color.
   */
  public set color(value) {
    this._color = value;
    this.textBlock.color = value;
  }

  private _fontFamily = 'Helvetica, Arial, sans-serif';
  /**
   * Returns the stencil's font family.
   */
  public get fontFamily() {
    return this._fontFamily;
  }
  /**
   * Sets the stencil's font family.
   */
  public set fontFamily(value) {
    this._fontFamily = value;
    this.textBlock.fontFamily = value;
  }

  private _fontSize: FontSize = {
    value: 1,
    units: 'rem',
    step: 0.1
  };
  /**
   * Returns the stencil's font size.
   */
  public get fontSize(): FontSize {
    return this._fontSize;
  }
  /**
   * Sets the stencil's font size.
   */
  public set fontSize(value: FontSize) {
    this._fontSize = value;
    this.textBlock.fontSize = value;
  }

  /**
   * Returns the default text for the stencil type.
   * @returns stencil type's default text.
   */
  protected getDefaultText(): string {
    return Object.getPrototypeOf(this).constructor.DEFAULT_TEXT;
  }
  private _text: string = this.getDefaultText();
  /**
   * Returns the stencil's text.
   */
  public get text(): string {
    return this.textBlock.text;
  }
  /**
   * Sets the stencil's text.
   */
  public set text(value: string) {
    this._text = value;
    this.textBlock.text = this._text;
  }


  /**
   * Text padding from the bounding box.
   */
  protected padding = 2;

  /**
   * Text's bounding box where text should fit and/or be anchored to.
   */
  public textBoundingBox: DOMRect;

  //public textElement!: SVGTextElement;
  
  /**
   * Text block handling the text rendering.
   */
  public textBlock: TextBlock = new TextBlock(this.getDefaultText());

  /**
   * {@inheritDoc core!StencilBase.constructor}
   */  
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

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

  /**
   * Adds the text element to the stencil's visual.
   */
  protected addTextElement() {
    this.visual.appendChild(this.textBlock.textElement);
  }

  public createVisual(): void {
    super.createVisual();
    this.addTextElement();
  }

  /**
   * Sets (adjusts) the text bounding box for the stencil.
   */
  protected setTextBoundingBox() {
    this.textBoundingBox.x = this.padding;
    this.textBoundingBox.y = this.padding;
    this.textBoundingBox.width = this.width - this.padding * 2;
    this.textBoundingBox.height = this.height - this.padding * 2;
    this.textBlock.boundingBox = this.textBoundingBox;
  }

  /**
   * Sets (adjusts) the stencil's size.
   */
  public setSize(): void {
    super.setSize();
    this.setTextBoundingBox();
  }

  /**
   * Sets the text color.
   * @param color text color
   */
  public setColor(color: string): void {
    this.color = color;
  }

  /**
   * Sets the font family.
   * @param font font family string
   */
  public setFont(font: string): void {
    this.fontFamily = font;
  }

  /**
   * Sets the font size.
   * @param fontSize font size
   */
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
