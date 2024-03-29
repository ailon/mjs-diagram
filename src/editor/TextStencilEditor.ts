import { IPoint } from '../core';
import { RectangleTextStencil } from '../core';
import { TextStencil } from '../core';
import { StencilBaseState } from '../core';

import { StencilBaseEditor } from './StencilBaseEditor';
import { TextBlockEditor } from './TextBlockEditor';
import { StencilEditorProperties } from './StencilEditorProperties';
import { TextPropertiesPanel } from './panels/TextPropertiesPanel';
import { PropertyPanelBase } from './panels/PropertyPanelBase';

/**
 * The default editor for the text-based stencils.
 */
export class TextStencilEditor extends StencilBaseEditor {
  /**
   * Panel for the text-related editor properties.
   */
  protected textPanel: TextPropertiesPanel;
  /**
   * Returns the stencil being edited.
   */
  public get stencil(): RectangleTextStencil {
    return this._stencil as RectangleTextStencil;
  }

  private textBlockEditor: TextBlockEditor;

  private isMoved = false;
  private pointerDownPoint?: IPoint;
  private pointerDownTimestamp!: number;

  /**
   * Creates a new text stencil editor instance.
   * @param properties editor properties.
   */
  constructor(properties: StencilEditorProperties) {
    super(properties);

    this.textBlockEditor = new TextBlockEditor();

    this.setColor = this.setColor.bind(this);
    this.setFont = this.setFont.bind(this);
    this.textChanged = this.textChanged.bind(this);
    this.showTextEditor = this.showTextEditor.bind(this);
    this.setSize = this.setSize.bind(this);
    this.positionTextEditor = this.positionTextEditor.bind(this);

    this.textPanel = new TextPropertiesPanel(this._language.getString('toolbox-text-title') ?? 'Text', this._language, {
      textColors: this.settings.getColorSet(this.stencil.typeName, 'text'),
      textColor: this.settings.getColor(this.stencil.typeName, 'text'),
      fontFamilies: this.settings.getFontFamilies(this.stencil.typeName),
      fontFamily: this.settings.getFontFamily(this.stencil.typeName),
      fontSize: this.settings.getFontSize(this.stencil.typeName)
    });

    this.textPanel.onColorChanged = (<TextStencil>this._stencil).setColor;
    this.textPanel.onFontFamilyChanged = (<TextStencil>this._stencil).setFont;
    this.textPanel.onFontSizeChanged = (<TextStencil>this._stencil).setFontSize;

    // causes text editor to open before the creation is finished
    this._suppressStencilCreateEvent = true;
  }

  public get propertyPanels(): PropertyPanelBase[] {
    return [...super.propertyPanels, this.textPanel];
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

    this.textBlockEditor.text = this.stencil.text;
    this.textBlockEditor.fontFamily = this.stencil.fontFamily;
    this.textBlockEditor.fontSize = `${this.stencil.fontSize.value}${this.stencil.fontSize.units}`;
    this.textBlockEditor.textColor = this.stencil.textBlock.color;

    this.positionTextEditor();

    this.textBlockEditor.onTextChanged = this.textChanged;

    this.overlayContainer.appendChild(this.textBlockEditor.getEditorUi());

    this.hideVisual();

    this.textBlockEditor.focus();
    document.execCommand('selectAll');
  }

  private positionTextEditor() {
    if (this.state === 'edit') {
      this.textBlockEditor.left =
        this.stencil.left + this.stencil.textBoundingBox.left;
      this.textBlockEditor.top =
        this.stencil.top + this.stencil.textBoundingBox.top;
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
    super.create(point);
    this.setSize();
    if (this._suppressStencilCreateEvent) {
      this.showTextEditor();
    }
    this.setFont(this.settings.getFontFamily(this.stencil.typeName));
    this.setColor(this.settings.getColor(this.stencil.typeName, 'text'));
  }

  public select(): void {
    super.select();
    if (this.state === 'edit') {
      this.textBlockEditor.blur();
    }
  }

  public deselect(): void {
    if (this.state === 'edit') {
      this.textBlockEditor.blur();
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
    this.textBlockEditor.textColor = color;
  }

  protected setFont(font: string): void {
    this.stencil.setFont(font);
    this.textBlockEditor.fontFamily = font;
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
