import { IPoint } from './IPoint';
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

  public textElement!: SVGTextElement;

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.setColor = this.setColor.bind(this);
    this.setFont = this.setFont.bind(this);
    this.renderText = this.renderText.bind(this);
    this.sizeText = this.sizeText.bind(this);
    this.setSize = this.setSize.bind(this);
  }

  public ownsTarget(el: EventTarget): boolean {
    if (
      super.ownsTarget(el) ||
      el === this.visual ||
      el === this.textElement
    ) {
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

  public createVisual(): void {
    super.createVisual();

    this.textElement = SvgHelper.createText([
      ['fill', this.color],
      ['font-family', this.fontFamily],
      ['font-size', '16px'],
      ['x', '0'],
      ['y', '0'],
    ]);
    this.textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // translate transorm
    this.textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // scale transorm

    this.visual.appendChild(this.textElement);

    this.renderText();
  }  

  public renderText() {
    const LINE_SIZE = '1.2em';

    if (this.textElement) {
      while (this.textElement.lastChild) {
        this.textElement.removeChild(this.textElement.lastChild);
      }

      const lines = this.text.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
      lines.forEach((line) => {
        this.textElement.appendChild(
          SvgHelper.createTSpan(
            // workaround for swallowed empty lines
            line.trim() === '' ? ' ' : line.trim(), [
            ['x', '0'],
            ['dy', LINE_SIZE],
          ])
        );
      });

      setTimeout(this.sizeText, 10);
    }
  }

  public getTextScale(): number {
    const textSize = this.textElement.getBBox();
    let scale = 1.0;
    if (textSize.width > 0 && textSize.height > 0) {
      const xScale =
        (this.width * 1.0 - (this.width * this.padding * 2) / 100) /
        textSize.width;
      const yScale =
        (this.height * 1.0 - (this.height * this.padding * 2) / 100) /
        textSize.height;
      scale = Math.min(xScale, yScale);
    }
    return scale;
  }

  private getTextPosition(scale: number): IPoint {
    const textSize = this.textElement.getBBox();
    let x = 0;
    let y = 0;
    if (textSize.width > 0 && textSize.height > 0) {
      x = (this.width - textSize.width * scale) / 2;
      y = this.height / 2 - (textSize.height * scale) / 2;
    }
    return { x: x, y: y };
  }

  public sizeText() {
    const textBBox = this.textElement.getBBox();
    const scale = this.getTextScale();
    const position = this.getTextPosition(scale);
    position.y -= textBBox.y * scale; // workaround adjustment for text not being placed at y=0

    if (navigator.userAgent.indexOf('Edge/') > -1) {
      // workaround for legacy Edge as transforms don't work otherwise but this way it doesn't work in Safari
      this.textElement.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale}, ${scale})`;
    } else {
      this.textElement.transform.baseVal
        .getItem(0)
        .setTranslate(position.x, position.y);
      this.textElement.transform.baseVal.getItem(1).setScale(scale, scale);
    }
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
    result.typeName = TextStencil.typeName;

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
    this.sizeText();
  }  

}