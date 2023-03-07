export type TextChangedHandler = (text: string) => void;

export class TextBlockEditor {
  private textEditor: HTMLDivElement;

  private _width = 0;
  public get width() {
    return this._width;
  }
  public set width(value) {
    this._width = value;
    this.textEditor.style.width = `${this.width}px`;
  }
  
  private _height = 0;
  public get height() {
    return this._height;
  }
  public set height(value) {
    this._height = value;
    this.textEditor.style.height = `${this.height}px`;
  }

  private _left = 0;
  public get left() {
    return this._left;
  }
  public set left(value) {
    this._left = value;
    this.textEditor.style.left = `${this.left}px`;
  }

  private _top = 0;
  public get top() {
    return this._top;
  }
  public set top(value) {
    this._top = value;
    this.textEditor.style.top = `${this.top}px`;
  }

  private _text = '';
  public get text() {
    return this._text;
  }
  public set text(value) {
    this._text = value;
  }

  private _fontFamily = 'sans-serif';
  public get fontFamily() {
    return this._fontFamily;
  }
  public set fontFamily(value) {
    this._fontFamily = value;
    this.textEditor.style.fontFamily = this._fontFamily;
  }

  private _fontSize = '1rem';
  public get fontSize() {
    return this._fontSize;
  }
  public set fontSize(value) {
    this._fontSize = value;
    this.textEditor.style.fontSize = this._fontSize;
  }

  private _textColor = '#000';
  public get textColor() {
    return this._textColor;
  }
  public set textColor(value) {
    this._textColor = value;
    this.textEditor.style.color = this.textColor;
  }

  public onTextChanged?: TextChangedHandler;

  constructor() {
    this.textEditor = document.createElement('div');

    this.getEditorUi = this.getEditorUi.bind(this);
    this.focus = this.focus.bind(this);
  }

  public getEditorUi(): HTMLDivElement {
    this.textEditor.style.position = 'absolute';
    this.textEditor.style.pointerEvents = 'auto';
    this.textEditor.style.width = `${this._width}px`;
    this.textEditor.style.height = `${this._height}px`;
    this.textEditor.style.overflowY = 'scroll';
    this.textEditor.style.textAlign = 'center';
    this.textEditor.style.fontFamily = this._fontFamily;
    this.textEditor.style.fontSize = this._fontSize;
    this.textEditor.style.lineHeight = '1em';
    this.textEditor.innerText = this._text;
    this.textEditor.contentEditable = 'true';
    this.textEditor.style.color = this._textColor;
    this.textEditor.style.whiteSpace = 'pre';
    this.textEditor.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
    });
    this.textEditor.addEventListener('pointerup', (ev) => {
      ev.stopPropagation();
    });
    this.textEditor.addEventListener('keyup', (ev) => {
      ev.cancelBubble = true;
    });
    this.textEditor.addEventListener('blur', () => {
      this._text = this.textEditor.innerText;
      if (this.onTextChanged !== undefined) {
        this.onTextChanged(this._text);
      }
    });
    this.textEditor.addEventListener('paste', (ev) => {
      if (ev.clipboardData) {
        // paste plain text
        const content = ev.clipboardData.getData('text');
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return false;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(content));
        ev.preventDefault();
      }
    });

    return this.textEditor;
  }

  public focus() {
    this.textEditor.focus();
  }
  public blur() {
    this.textEditor.blur();
  }
}