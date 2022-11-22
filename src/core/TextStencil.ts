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

  public textElement!: SVGForeignObjectElement;
  public textContainer!: HTMLDivElement;

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.setColor = this.setColor.bind(this);
    this.setFont = this.setFont.bind(this);
    this.renderText = this.renderText.bind(this);
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

    this.textElement = SvgHelper.createForeignObject([
      ['x', '0'],
      ['y', '0'],
      ['width', this.width.toString()],
      ['height', this.height.toString()],
    ]);
    this.textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // translate transorm
    this.textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // scale transorm

    this.visual.appendChild(this.textElement);

    this.textContainer = document.createElement('div');
    this.textContainer.style.display = 'flex';
    this.textContainer.style.width = '100%';
    this.textContainer.style.height = '100%';
    this.textContainer.style.alignItems = 'center';
    this.textContainer.style.justifyContent = 'center';
    this.textContainer.style.textAlign = 'center';
    this.textContainer.style.fontSize = '1rem';

    this.textElement.appendChild(this.textContainer);

    this.renderText();
  }  

  public setSize(): void {
    super.setSize();
    SvgHelper.setAttributes(this.textElement, [
      ['width', this.width.toString()],
      ['height', this.height.toString()],
    ]);
  }

  public renderText() {
    this.textContainer.innerText = this.text;
    SvgHelper.setAttributes(this.textElement, [
      ['width', this.width.toString()],
      ['height', this.height.toString()],
    ]);
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
  }  

}