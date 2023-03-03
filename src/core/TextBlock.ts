import { SvgHelper } from "./SvgHelper";

export class TextBlock {
  private _text = '';
  public get text() {
    return this._text;
  }
  public set text(value) {
    this._text = value;
    this.renderText();
  }

  private _boundingBox: DOMRect = new DOMRect();
  public get boundingBox(): DOMRect {
    return this._boundingBox;
  }
  public set boundingBox(value: DOMRect) {
    this._boundingBox = value;
    this.positionText();
  }

  private _textElement: SVGTextElement = SvgHelper.createText();
  public get textElement(): SVGTextElement {
    return this._textElement;
  }

  private _color = 'transparent';
  public set color(value: string) {
    if (this.textElement) {
      SvgHelper.setAttributes(this._textElement, [['fill', value]]);
    }
    this._color = value;
  }
  public get color(): string {
    return this._color;
  }

  private _fontFamily = '';
  public get fontFamily() {
    return this._fontFamily;
  }
  public set fontFamily(value) {
    if (this._textElement) {
      SvgHelper.setAttributes(this.textElement, [['font-family', value]]);
    }
    this._fontFamily = value;
    this.positionText();
  }

  constructor(text?: string) {
    this.setupTextElement();

    if (text !== undefined) {
      this.text = text;
    }

    this.setupTextElement = this.setupTextElement.bind(this);
    this.renderText = this.renderText.bind(this);
    this.positionText = this.positionText.bind(this);
    this.ownsTarget = this.ownsTarget.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  public ownsTarget(el: EventTarget) {
    if (el === this._textElement) {
      return true;
    } else {
      let found = false;
      this._textElement.childNodes.forEach((span) => {
        if (span === el) {
          found = true;
        }
      });
      return found;
    }    
  }

  private setupTextElement() {
    this._textElement.style.fontSize = '1rem';
    this._textElement.style.textAnchor = 'middle';
    this._textElement.style.dominantBaseline = 'hanging';
    this._textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // translate transorm
    this._textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // scale transorm
  }

  public renderText() {
    const LINE_SIZE = '1rem';

    if (this._textElement) {
      while (this._textElement.lastChild) {
        this._textElement.removeChild(this._textElement.lastChild);
      }

      const lines = this.text.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
      lines.forEach((line, lineno) => {
        this._textElement.appendChild(
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

      setTimeout(() => { this.positionText(this) }, 10);
    }
  }

  public positionText(textBlock?: TextBlock) {
    const self = textBlock === undefined ? this : textBlock;

    const textBBox = self._textElement.getBBox();
    const centerX =
      self.boundingBox.x +
      self.boundingBox.width / 2;
    const centerY =
      self.boundingBox.y +
      self.boundingBox.height / 2 - textBBox.height / 2;

    self._textElement.childNodes.forEach((ts) => {
      const tspan = <SVGTSpanElement>ts;
      SvgHelper.setAttributes(tspan, [['x', `${centerX}`]]);
    });
    SvgHelper.setAttributes(self._textElement, [['x', `${centerX}`]]);
    SvgHelper.setAttributes(self._textElement, [['y', `${centerY}`]]);
  }

  public show() {
    this._textElement.style.display = '';
  }
  public hide() {
    this._textElement.style.display = 'none';
  }
}