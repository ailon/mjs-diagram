import { IPoint } from '../core/IPoint';
import { StencilBaseEditor } from './StencilBaseEditor';
import { RectangleTextStencil } from '../core/RectangleTextStencil';
import { StencilBaseState } from '../core/StencilBaseState';
import { TextBlockEditor } from '../core/TextBlockEditor';

export class TextStencilEditor extends StencilBaseEditor {
  public get stencil(): RectangleTextStencil {
    return this._stencil as RectangleTextStencil;
  }

  private textBlockEditor: TextBlockEditor;

  private isMoved = false;
  private pointerDownPoint?: IPoint;
  private pointerDownTimestamp!: number;

  constructor(
    iid: number,
    container: SVGGElement,
    overlayContainer: HTMLDivElement,
    stencilType: typeof RectangleTextStencil,
    stencil?: RectangleTextStencil
  ) {
    super(iid, container, overlayContainer, stencilType, stencil);

    this.textBlockEditor = new TextBlockEditor();

    this.setColor = this.setColor.bind(this);
    this.setFont = this.setFont.bind(this);
    this.textChanged = this.textChanged.bind(this);
    this.showTextEditor = this.showTextEditor.bind(this);
    this.setSize = this.setSize.bind(this);
    this.positionTextEditor = this.positionTextEditor.bind(this);
  }

  public pointerDown(point: IPoint, target?: EventTarget): void {
    super.pointerDown(point, target);

    this.isMoved = false;
    this.pointerDownPoint = point;
    this.pointerDownTimestamp = Date.now();
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
  }

  public pointerUp(point: IPoint): void {
    super.pointerUp(point);
    this.setSize();
    this.pointerDownPoint = undefined;
  }

  private showTextEditor() {
    this._state = 'edit';
    this.overlayContainer.innerHTML = '';

    this.positionTextEditor();

    this.textBlockEditor.onTextChanged = this.textChanged;

    this.overlayContainer.appendChild(this.textBlockEditor.getEditorUi());

    this.hideVisual();

    this.textBlockEditor.focus();
    document.execCommand('selectAll');
  }

  private positionTextEditor() {
    if (this.state === 'edit') {
      this.textBlockEditor.left = this.stencil.left + this.stencil.textBoundingBox.left;
      this.textBlockEditor.top = this.stencil.top + this.stencil.textBoundingBox.top;
      this.textBlockEditor.width = this.stencil.textBoundingBox.width;
      this.textBlockEditor.height = this.stencil.textBoundingBox.height;
    }
  }

  private textChanged(text: string) {
    this.stencil.text = text.trim();
    this.overlayContainer.innerHTML = '';
    this.stencil.textBlock.show();
    this.showVisual();
    if (this._suppressStencilCreateEvent) {
      this._suppressStencilCreateEvent = false;
      if (this.onStencilCreated) {
        this.onStencilCreated(this);
      }
    }
  }

  public create(point: IPoint): void {
    this._suppressStencilCreateEvent = true;
    super.create(point);
    this.setSize();
    this.showTextEditor();
    this.setColor('#000000');
  }

  public select(): void {
    super.select();
    // if (this.state === 'edit') {
    //   this.textChanged(this.textEditor.innerText);
    // }
  }

  public deselect(): void {
    // if (this.state === 'edit') {
    //   this.textChanged(this.textEditor.innerText);
    // }
    super.deselect();
  }

  // @todo
  // public dblClick(point: IPoint, target?: EventTarget): void {
  //   super.dblClick(point, target);

  //   this.showTextEditor();
  // }

  protected setColor(color: string): void {
    this.stencil.setColor(color);
    this.textBlockEditor.textColor = this.stencil.color;
  }

  protected setFont(font: string): void {
    this.stencil.setFont(font);
    this.textBlockEditor.fontFamily = this.stencil.fontFamily;
  }

  protected hideVisual(): void {
    this.stencil.textBlock.hide();
    this.hideControlBox();
  }

  protected showVisual(): void {
    if (this.state === 'edit') {
      this._state = 'select';
    }
    this.stencil.textBlock.show();
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
