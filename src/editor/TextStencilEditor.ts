import { IPoint } from '../core/IPoint';
import { StencilBaseEditor } from './StencilBaseEditor';
import { TextStencil } from '../core/TextStencil';
import { StencilBaseState } from '../core/StencilBaseState';

export class TextStencilEditor extends StencilBaseEditor {
  public get stencil(): TextStencil {
    return this._stencil as TextStencil;
  }

  protected textEditDiv!: HTMLDivElement;
  protected textEditor!: HTMLDivElement;

  private isMoved = false;
  private pointerDownPoint?: IPoint;
  private pointerDownTimestamp!: number;

  constructor(
    iid: number,
    container: SVGGElement,
    overlayContainer: HTMLDivElement,
    stencilType: typeof TextStencil,
    stencil?: TextStencil
  ) {
    super(iid, container, overlayContainer, stencilType, stencil);

    this.setColor = this.setColor.bind(this);
    this.setFont = this.setFont.bind(this);
    this.textEditDivClicked = this.textEditDivClicked.bind(this);
    this.showTextEditor = this.showTextEditor.bind(this);
    this.setSize = this.setSize.bind(this);
    this.positionTextEditor = this.positionTextEditor.bind(this);
  }

  public pointerDown(point: IPoint, target?: EventTarget): void {
    super.pointerDown(point, target);

    this.isMoved = false;
    this.pointerDownPoint = point;
    this.pointerDownTimestamp = Date.now();

    if (this.state === 'new') {
      this.stencil.moveVisual(point);
      this._state = 'creating';
    } else if (this.state === 'creating') {
      this.setColor('#000000');
    }
  }

  public dblClick(point: IPoint, target?: EventTarget): void {
    super.dblClick(point, target);

    this.showTextEditor();
  }

  public manipulate(point: IPoint): void {
    super.manipulate(point);
    if (this.pointerDownPoint !== undefined) {
      this.isMoved =
        Math.abs(point.x - this.pointerDownPoint.x) > 5 ||
        Math.abs(point.y - this.pointerDownPoint.y) > 5;
    }
  }

  protected resize(point: IPoint): void {
    super.resize(point);
    this.isMoved = true;
    this.setSize();
    // this.stencil.sizeText();
  }

  public pointerUp(point: IPoint): void {
    const inState = this.state;
    if (inState === 'creating') {
      this._suppressStencilCreateEvent = true;
    }
    super.pointerUp(point);
    this.setSize();
    if (
      inState === 'creating' ||
      (!this.isMoved && Date.now() - this.pointerDownTimestamp > 500)
    ) {
      this.showTextEditor();
    }
    this.pointerDownPoint = undefined;
  }

  private showTextEditor() {
    this._state = 'edit';
    this.overlayContainer.innerHTML = '';

    this.textEditDiv = document.createElement('div');
    // textEditDiv.style.display = 'flex';
    this.textEditDiv.style.flexGrow = '2';
    //textEditDiv.style.backgroundColor = 'rgb(0,0,0,0.7)';
    this.textEditDiv.style.alignItems = 'center';
    this.textEditDiv.style.justifyContent = 'center';
    this.textEditDiv.style.pointerEvents = 'auto';
    this.textEditDiv.style.overflow = 'hidden';

    this.textEditor = document.createElement('div');
    this.textEditor.style.position = 'absolute';
    this.textEditor.style.width = `${this.stencil.width}px`;
    this.textEditor.style.height = `${this.stencil.height}px`;
    this.textEditor.style.overflowY = 'scroll';
    this.textEditor.style.textAlign = 'center';
    this.textEditor.style.fontFamily = this.stencil.fontFamily;
    this.textEditor.style.lineHeight = '1em';
    this.textEditor.innerText = this.stencil.text;
    this.textEditor.contentEditable = 'true';
    this.textEditor.style.color = this.stencil.color;
    this.textEditor.style.whiteSpace = 'pre';
    this.positionTextEditor();
    this.textEditor.addEventListener('pointerup', (ev) => {
      ev.stopPropagation();
    });
    // this.textEditor.addEventListener('input', () => {
    //   let fontSize = Number.parseFloat(this.textEditor.style.fontSize);
    //   while (
    //     this.textEditor.clientWidth >=
    //       Number.parseInt(this.textEditor.style.maxWidth) &&
    //     fontSize > 0.9
    //   ) {
    //     fontSize -= 0.1;
    //     this.textEditor.style.fontSize = `${Math.max(fontSize, 0.9)}em`;
    //   }
    // });
    this.textEditor.addEventListener('keyup', (ev) => {
      ev.cancelBubble = true;
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

    this.textEditDiv.addEventListener('pointerup', () => {
      this.textEditDivClicked(this.textEditor.innerText);
    });
    this.textEditDiv.appendChild(this.textEditor);
    this.overlayContainer.appendChild(this.textEditDiv);

    this.hideVisual();

    this.textEditor.focus();
    document.execCommand('selectAll');
  }

  private positionTextEditor() {
    if (this.state === 'edit') {
      if (this.textEditor === undefined) {
        this.showTextEditor();
      } else {
        this.stencil.textElement.style.display = '';
        // const textScale = 1; // this.stencil.getTextScale();
        // const rPosition = {
        //   x: this.stencil.left + this.stencil.width / 2,
        //   y: this.stencil.top + this.stencil.height / 2,
        // };
        // const textSize = this.stencil.textElement.getBBox();
        // const rWH = {
        //   x: textSize.width * textScale,
        //   y: textSize.height * textScale,
        // };
        // rPosition.x -= rWH.x / 2;
        // rPosition.y -= rWH.y / 2;

        this.textEditor.style.top = `${this.stencil.top + this.stencil.textBoundingBox.top}px`;
        this.textEditor.style.left = `${this.stencil.left + this.stencil.textBoundingBox.left}px`;
        this.textEditor.style.maxWidth = `${this.stencil.textBoundingBox.width}px`;
        this.textEditor.style.maxHeight = `${this.stencil.textBoundingBox.height}px`;
        // this.textEditor.style.maxWidth = `${
        //   this.overlayContainer.offsetWidth - rPosition.x
        // }px`;
        this.textEditor.style.fontSize = `1rem`; // @todo - configurable in stencil
        this.stencil.textElement.style.display = 'none';
      }
    }
  }

  private textEditDivClicked(text: string) {
    this.stencil.text = text.trim();
    this.overlayContainer.innerHTML = '';
    this.stencil.renderText();
    this.showVisual();
    if (this._suppressStencilCreateEvent) {
      this._suppressStencilCreateEvent = false;
      if (this.onStencilCreated) {
        this.onStencilCreated(this);
      }
    }
  }

  public select(): void {
    super.select();
    if (this.state === 'edit') {
      this.textEditDivClicked(this.textEditor.innerText);
    }
  }

  public deselect(): void {
    if (this.state === 'edit') {
      this.textEditDivClicked(this.textEditor.innerText);
    }
    super.deselect();
  }

  // @todo
  // public dblClick(point: IPoint, target?: EventTarget): void {
  //   super.dblClick(point, target);

  //   this.showTextEditor();
  // }

  protected setColor(color: string): void {
    this.stencil.setColor(color);
    if (this.textEditor) {
      this.textEditor.style.color = this.stencil.color;
    }
  }

  protected setFont(font: string): void {
    this.stencil.setFont(font);
    if (this.textEditor) {
      this.textEditor.style.fontFamily = this.stencil.fontFamily;
    }
  }

  protected hideVisual(): void {
    this.stencil.textElement.style.display = 'none';
    this.hideControlBox();
  }

  protected showVisual(): void {
    if (this.state === 'edit') {
      this._state = 'select';
    }
    this.stencil.textElement.style.display = '';
    this.showControlBox();
  }

  public scale(scaleX: number, scaleY: number): void {
    super.scale(scaleX, scaleY);

    this.positionTextEditor();
  }

  public restoreState(state: StencilBaseState): void {
    super.restoreState(state);
  }
}
