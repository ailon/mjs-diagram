import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';
import { TextStencilState } from './TextStencilState';

export class TextStencil extends StencilBase {
  public static typeName = 'TextStencil';

  public static title = 'Text stencil';

  public color = 'transparent';
  public fontFamily = 'Helvetica, Arial, sans-serif';

  private readonly DEFAULT_TEXT = 'your text here';
  public text: string = this.DEFAULT_TEXT;

  protected padding = 5;

  public textBoundingBox: DOMRect;

  public textElement!: SVGTextElement;
  public textContainer!: HTMLDivElement;

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.setColor = this.setColor.bind(this);
    this.setFont = this.setFont.bind(this);
    this.createTextElement = this.createTextElement.bind(this);
    this.renderText = this.renderText.bind(this);
    this.setSize = this.setSize.bind(this);
    this.positionText = this.positionText.bind(this);

    this.textBoundingBox = new DOMRect();
  }

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const result = super.getThumbnail(width, height);

    const fontSize = Math.max(height * 0.1, 10);

    const text = SvgHelper.createText([
      ['x', (width/2).toString()],
      ['y', (height/2 - fontSize/2).toString()],
      ['width', width.toString()]
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
    if (super.ownsTarget(el) || el === this.visual || el === this.textElement) {
      return true;
    } else {
      let found = false;
      this.textElement.childNodes.forEach((span) => {
        if (span === el) {
          found = true;
        }
      });
      return found;
    }
  }

  protected createTextElement() {
    this.textElement = SvgHelper.createText();
    this.textElement.style.fontSize = '1rem';
    this.textElement.style.textAnchor = 'middle';
    this.textElement.style.dominantBaseline = 'hanging';
    this.textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // translate transorm
    this.textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // scale transorm

    this.visual.appendChild(this.textElement);

    this.renderText();
  }

  public createVisual(): void {
    super.createVisual();
    this.createTextElement();
  }

  protected setTextBoundingBox() {
    this.textBoundingBox.x = this.padding;
    this.textBoundingBox.y = this.padding;
    this.textBoundingBox.width = this.width - this.padding * 2;
    this.textBoundingBox.height = this.height - this.padding * 2;
  }

  public setSize(): void {
    super.setSize();
    this.setTextBoundingBox();
    this.positionText();
  }

  public renderText() {
    const LINE_SIZE = '1rem';

    if (this.textElement) {
      while (this.textElement.lastChild) {
        this.textElement.removeChild(this.textElement.lastChild);
      }

      const lines = this.text.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
      lines.forEach((line, lineno) => {
        this.textElement.appendChild(
          SvgHelper.createTSpan(
            // workaround for swallowed empty lines
            line.trim() === '' ? ' ' : line.trim(),
            [
              // ['x', '0'],
              ['dy', lineno > 0 ? LINE_SIZE : '0'],
            ]
          )
        );
      });

      setTimeout(this.positionText, 10);
    }
  }

  public positionText() {
    const textBBox = this.textElement.getBBox();
    const centerX =
      this.textBoundingBox.x +
      this.textBoundingBox.width / 2;
    const centerY =
      this.textBoundingBox.y +
      this.textBoundingBox.height / 2 - textBBox.height / 2;

    this.textElement.childNodes.forEach((ts) => {
      const tspan = <SVGTSpanElement>ts;
      SvgHelper.setAttributes(tspan, [['x', `${centerX}`]]);
    });
    SvgHelper.setAttributes(this.textElement, [['x', `${centerX}`]]);
    SvgHelper.setAttributes(this.textElement, [['y', `${centerY}`]]);
  }

  public setColor(color: string): void {
    if (this.textElement) {
      SvgHelper.setAttributes(this.textElement, [['fill', color]]);
    }
    this.color = color;
  }

  public setFont(font: string): void {
    if (this.textElement) {
      SvgHelper.setAttributes(this.textElement, [['font-family', font]]);
    }
    this.fontFamily = font;
    this.renderText();
  }

  public getState(): TextStencilState {
    const result: TextStencilState = Object.assign(
      {
        color: this.color,
        fontFamily: this.fontFamily,
        padding: this.padding,
        text: this.text,
      },
      super.getState()
    );

    return result;
  }

  public restoreState(state: TextStencilState): void {
    const textState = state as TextStencilState;
    this.color = textState.color;
    this.fontFamily = textState.fontFamily;
    this.padding = textState.padding;
    this.text = textState.text;

    super.restoreState(state);
    this.renderText();
  }

  public scale(scaleX: number, scaleY: number): void {
    super.scale(scaleX, scaleY);

    this.setSize();
  }
}
