import { FontSize } from "./FontSize";
import { SvgHelper } from './SvgHelper';

/**
 * TextBlock represents a block of text used across all text-based stencils and connector labels.
 */
export class TextBlock {
  /**
   * Fired when text size changes.
   * 
   * @group Events
   */
  public onTextSizeChanged?: (textBlock: TextBlock) => void;

  private _text = '';
  /**
   * Returns the text block's text
   */
  public get text() {
    return this._text;
  }
  /**
   * Sets the text block's text.
   */
  public set text(value) {
    this._text = value;
    this.renderText();
  }

  /**
   * Text block's horizontal offset from the automatically calculated position.
   */
  public offsetX = 0;
  /**
   * Text block's vertical offset from the automatically calculated position.
   */
  public offsetY = 0;

  private _boundingBox: DOMRect = new DOMRect();
  /**
   * Returns the bounding box where text should fit and/or be anchored.
   */
  public get boundingBox(): DOMRect {
    return this._boundingBox;
  }
  /**
   * Sets the bounding box where text should fit and/or be anchored.
   */
  public set boundingBox(value: DOMRect) {
    this._boundingBox = value;
    this.positionText();
  }

  private _labelBackground: SVGRectElement = SvgHelper.createRect(10, 10, [
    ['fill', 'white'],
  ]);
  /**
   * Returns the background rectangle (behind the text).
   */
  public get labelBackground(): SVGRectElement {
    return this._labelBackground;
  }

  private _textElement: SVGTextElement = SvgHelper.createText();
  /**
   * Returns the text block's text element.
   */
  public get textElement(): SVGTextElement {
    return this._textElement;
  }

  private _color = 'transparent';
  /**
   * Sets the text color.
   */
  public set color(value: string) {
    if (this.textElement) {
      SvgHelper.setAttributes(this._textElement, [['fill', value]]);
    }
    this._color = value;
  }
  /**
   * Returns the text color.
   */
  public get color(): string {
    return this._color;
  }

  private _fontFamily = '';
  /**
   * Returns the text's font family.
   */
  public get fontFamily() {
    return this._fontFamily;
  }
  /**
   * Sets the text's font family.
   */
  public set fontFamily(value) {
    if (this._textElement) {
      this._textElement.style.fontFamily = value;
    }
    this._fontFamily = value;
    this.positionText();
  }

  private _fontSize: FontSize = {
    value: 1,
    units: 'rem',
    step: 0.1,
  };
  /**
   * Returns the text's font size.
   */
  public get fontSize() {
    return this._fontSize;
  }
  /**
   * Sets the text's font size.
   */
  public set fontSize(value: FontSize) {
    if (this._textElement) {
      this._textElement.style.fontSize = `${value.value}${value.units}`;
    }
    this._fontSize = value;
    this.positionText();
  }

  /**
   * Creates a text block
   * @param text initial text
   */
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
    this.showControlBox = this.showControlBox.bind(this);
    this.hideControlBox = this.hideControlBox.bind(this);
    this.applyFontStyles = this.applyFontStyles.bind(this);
  }

  /**
   * Returns true if the text block contains the supplied element.
   * @param el element to test.
   * @returns true if the element belongs to the text block, false otherwise.
   */
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
    this._textElement.style.fontSize = `${this.fontSize.value}${this.fontSize.units}`;
    this._textElement.style.textAnchor = 'middle';
    this._textElement.style.dominantBaseline = 'text-before-edge';
    this._textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // translate transorm
    this._textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // scale transorm

    this._labelBackground.style.stroke = '#aaa';
    this._labelBackground.style.strokeDasharray = '2 2';
    this._labelBackground.style.strokeWidth = '1';
    this._labelBackground.style.strokeOpacity = '0';
  }

  /**
   * Renders text within the text block according to its settings.
   */
  public renderText() {
    const LINE_SIZE = `${this.fontSize.value}${this.fontSize.units}`;

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

      // hide to prevent jerky movements during layout
      this.textElement.style.opacity = '0';

      setTimeout(() => {
        this.positionText(this);
      }, 100);
    }
  }

  private applyFontStyles() {
    this._textElement.childNodes.forEach((ts) => {
      const tspan = <SVGTSpanElement>ts;
      tspan.style.fontFamily = this._textElement.style.fontFamily;
      tspan.style.fontSize = this._textElement.style.fontSize;
    });
  }

  private _textSize?: DOMRect;
  /**
   * Returns the size of the rectangle containing the text block's text.
   */
  public get textSize(): DOMRect | undefined {
    return this._textSize;
  }

  /**
   * Positions the text within the text block.
   * @param textBlock 
   */
  public positionText(textBlock?: TextBlock) {
    const self = textBlock === undefined ? this : textBlock;
    const LINE_SIZE = `${this.fontSize.value}${this.fontSize.units}`;

    self.applyFontStyles();

    self._textSize = self._textElement.getBBox();
    const centerX =
      self.boundingBox.x + self.boundingBox.width / 2 + self.offsetX;
    const centerY =
      self.boundingBox.y +
      self.boundingBox.height / 2 -
      self._textSize.height / 2 +
      self.offsetY;

    self._textElement.childNodes.forEach((ts, lineno) => {
      const tspan = <SVGTSpanElement>ts;
      SvgHelper.setAttributes(tspan, [
        ['x', `${centerX}`],
        ['dy', lineno > 0 ? LINE_SIZE : '0'],
      ]);
    });
    SvgHelper.setAttributes(self._textElement, [['x', `${centerX}`]]);
    SvgHelper.setAttributes(self._textElement, [['y', `${centerY}`]]);

    const bgPadding = 1.2;
    SvgHelper.setAttributes(self.labelBackground, [
      ['width', (self._textSize.width * bgPadding).toString()],
      ['height', (self._textSize.height * bgPadding).toString()],
      ['x', (centerX - (self._textSize.width * bgPadding) / 2).toString()],
      ['y', (centerY - (self._textSize.height / 2) * (bgPadding - 1) * 2).toString()],
    ]);

    if (self.onTextSizeChanged) {
      self.onTextSizeChanged(self);
    }

    // restore visibility
    this.textElement.style.opacity = '1';
  }

  /**
   * Makes the text block content visible.
   */
  public show() {
    this._textElement.style.display = '';
    this._labelBackground.style.display = '';
  }
  /**
   * Hides the text block content.
   */
  public hide() {
    this._textElement.style.display = 'none';
    this._labelBackground.style.display = 'none';
  }

  /**
   * Shows the text block's dashed outline.
   */
  public showControlBox() {
    this.labelBackground.style.strokeOpacity = '1';
  }
  /**
   * Hides the text block's dashed outline.
   */
  public hideControlBox() {
    this.labelBackground.style.strokeOpacity = '0';
  }
}
