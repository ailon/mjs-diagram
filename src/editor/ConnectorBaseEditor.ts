import { ConnectorBase } from '../core/ConnectorBase';
import { IPoint } from '../core/IPoint';
import { ResizeGrip } from './ResizeGrip';
import { SvgHelper } from '../core/SvgHelper';
import { Port } from '../core/Port';
import {
  ConnectorBaseState,
  ConnectorEndPoints,
} from '../core/ConnectorBaseState';

export type ConnectorState = 'new' | 'creating' | 'select' | 'move' | 'edit';

export class ConnectorBaseEditor {
  protected _state: ConnectorState = 'new';
  public get state(): ConnectorState {
    return this._state;
  }

  public onConnectorCreated?: (connector: ConnectorBaseEditor) => void;
  public onConnectorUpdated?: (connector: ConnectorBaseEditor) => void;

  protected manipulationStartX = 0;
  protected manipulationStartY = 0;
  protected prevX = 0;
  protected prevY = 0;

  private manipulationStartX1 = 0;
  private manipulationStartY1 = 0;
  private manipulationStartX2 = 0;
  private manipulationStartY2 = 0;

  private isDraggingLabel = false;

  protected textEditDiv!: HTMLDivElement;
  protected textEditor!: HTMLDivElement;

  /**
   * Container for control elements.
   */
  protected controlBox!: SVGGElement;

  /**
   * First manipulation grip
   */
  protected grip1!: ResizeGrip;
  /**
   * Second manipulation grip.
   */
  protected grip2!: ResizeGrip;
  /**
   * Active manipulation grip.
   */
  protected activeGrip?: ResizeGrip;

  public connector: ConnectorBase;
  public movingPort?: Port;

  protected overlayContainer: HTMLDivElement;

  constructor(
    iid: number,
    container: SVGGElement,
    overlayContainer: HTMLDivElement,
    connectorType: typeof ConnectorBase,
    connector?: ConnectorBase
  ) {
    this.connector = connector ?? new connectorType(iid, container);
    this.connector.container = container;
    this.overlayContainer = overlayContainer;

    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);
    this.setupControlBox = this.setupControlBox.bind(this);
    this.adjustControlBox = this.adjustControlBox.bind(this);
    this.showControlBox = this.showControlBox.bind(this);
    this.hideControlBox = this.hideControlBox.bind(this);
    this.restoreState = this.restoreState.bind(this);

    this.pointerDown = this.pointerDown.bind(this);
    this.pointerUp = this.pointerUp.bind(this);
    this.manipulate = this.manipulate.bind(this);

    this.showTextEditor = this.showTextEditor.bind(this);
    this.positionTextEditor = this.positionTextEditor.bind(this);
    this.textEditDivClicked = this.textEditDivClicked.bind(this);
  }

  public ownsTarget(el: EventTarget | null): boolean {
    let found = false;
    if (el !== null) {
      if (
        this.grip1.ownsTarget(el) ||
        this.grip2.ownsTarget(el) ||
        this.connector.ownsTarget(el)
      ) {
        found = true;
      } else {
        found = false;
      }
    }
    return found;
  }

  protected _isSelected = false;
  public get isSelected(): boolean {
    return this._isSelected;
  }

  public select(): void {
    this.connector.container.style.cursor = 'move';
    this._isSelected = true;
    if (this.controlBox === undefined) {
      this.setupControlBox();
    }
    this.adjustControlBox();
    this.showControlBox();
  }

  public deselect(): void {
    this.connector.container.style.cursor = 'default';
    this._isSelected = false;
    this.hideControlBox();
  }

  protected hideControlBox(): void {
    this.controlBox.style.display = 'none';
    this.connector.labelBackground.style.strokeOpacity = '0';
  }
  protected showControlBox(): void {
    if (this.controlBox === undefined) {
      this.setupControlBox();
    }
    this.controlBox.style.display = '';
    this.connector.labelBackground.style.strokeOpacity = '1';
  }

  public pointerDown(point: IPoint, target?: EventTarget): void {
    this.manipulationStartX = point.x;
    this.manipulationStartY = point.y;
    this.prevX = point.x;
    this.prevY = point.y;

    if (this.state === 'new') {
      this.connector.createVisual();
      this.connector.x1 = point.x;
      this.connector.y1 = point.y;
      this.connector.x2 = point.x;
      this.connector.y2 = point.y;
    }

    this.manipulationStartX1 = this.connector.x1;
    this.manipulationStartY1 = this.connector.y1;
    this.manipulationStartX2 = this.connector.x2;
    this.manipulationStartY2 = this.connector.y2;

    if (this.state !== 'new') {
      this.select();
      if (target && this.grip1.ownsTarget(target)) {
        this.activeGrip = this.grip1;
        this.movingPort = this.connector.startPort;
      } else if (target && this.grip2.ownsTarget(target)) {
        this.activeGrip = this.grip2;
        this.movingPort = this.connector.endPort;
      } else if (target && this.connector.labelOwnsTarget(target)) {
        this.isDraggingLabel = true;
      } else {
        this.activeGrip = undefined;
        this.movingPort = undefined;
        this.isDraggingLabel = false;
      }

      if (this.activeGrip) {
        this._state = 'move';
        SvgHelper.setAttributes(this.connector.container, [
          ['pointer-events', 'none'],
        ]);
      } else {
        this._state = 'select';
      }
    } else {
      this.connector.adjustVisual();
      this.showControlBox();

      this._state = 'creating';
      SvgHelper.setAttributes(this.connector.container, [
        ['pointer-events', 'none'],
      ]);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public dblClick(point: IPoint, target?: EventTarget): void {
    this.showTextEditor();
  }

  public manipulate(point: IPoint): void {
    if (this.state === 'creating') {
      this.resize(point);
    } else if (this.state === 'move') {
      if (this.activeGrip === this.grip1) {
        this.connector.setStartPosition({
          x: this.manipulationStartX1 + point.x - this.manipulationStartX,
          y: this.manipulationStartY1 + point.y - this.manipulationStartY,
        });
      } else if (this.activeGrip === this.grip2) {
        this.connector.setEndPosition({
          x: this.manipulationStartX2 + point.x - this.manipulationStartX,
          y: this.manipulationStartY2 + point.y - this.manipulationStartY,
        });
      } 
    } else if (this.isDraggingLabel) {
      if (point.x !== 0 || point.y !== 0) { // not resetting
        this.connector.moveLabel(
          point.x - this.prevX,
          point.y - this.prevY
        );
      }
    }
    this.adjustControlBox();

    this.prevX = point.x;
    this.prevY = point.y;
  }

  protected resize(point: IPoint): void {
    switch (this.activeGrip) {
      case this.grip1:
        this.connector.setStartPosition({ x: point.x, y: point.y });
        break;
      case this.grip2:
      case undefined:
        this.connector.setEndPosition({ x: point.x, y: point.y });
        break;
    }
    this.adjustControlBox();
  }

  protected setupControlBox(): void {
    this.controlBox = SvgHelper.createGroup();
    this.connector.container.appendChild(this.controlBox);

    this.addControlGrips();

    this.connector.labelBackground.style.stroke = '#aaa';
    this.connector.labelBackground.style.strokeDasharray = '2 2';
    this.connector.labelBackground.style.strokeWidth = '1';
    this.connector.labelBackground.style.strokeOpacity = '0';

    this.controlBox.style.display = 'none';
  }

  private adjustControlBox() {
    if (this.controlBox === undefined) {
      this.setupControlBox();
    }
    this.positionGrips();
  }

  protected addControlGrips(): void {
    this.grip1 = this.createGrip();
    this.grip2 = this.createGrip();

    this.positionGrips();
  }

  protected createGrip(): ResizeGrip {
    const grip = new ResizeGrip();
    grip.visual.transform.baseVal.appendItem(SvgHelper.createTransform());
    this.controlBox.appendChild(grip.visual);

    return grip;
  }

  protected positionGrips(): void {
    const gripSize = this.grip1.GRIP_SIZE;

    this.positionGrip(
      this.grip1.visual,
      this.connector.x1 - gripSize / 2,
      this.connector.y1 - gripSize / 2
    );
    this.positionGrip(
      this.grip2.visual,
      this.connector.x2 - gripSize / 2,
      this.connector.y2 - gripSize / 2
    );
  }

  protected positionGrip(grip: SVGGraphicsElement, x: number, y: number): void {
    const translate = grip.transform.baseVal.getItem(0);
    translate.setTranslate(x, y);
    grip.transform.baseVal.replaceItem(translate, 0);
  }

  public pointerUp(point: IPoint): void {
    const inState = this.state;
    this.manipulate(point);
    this._state = 'select';
    if (inState === 'creating') {
      this.deselect();
      if (this.onConnectorCreated) {
        this.onConnectorCreated(this);
      }
    } else if (inState === 'move') {
      this.deselect();
      this.connector.adjustPoints();
      this.connector.adjustVisual();
      if (this.onConnectorUpdated) {
        this.onConnectorUpdated(this);
      }
      this.activeGrip = undefined;
    } else if (this.isDraggingLabel) {
      this.connector.adjustPoints();
      this.connector.adjustVisual();
      this.isDraggingLabel = false;
    }

    SvgHelper.setAttributes(this.connector.container, [
      ['pointer-events', 'auto'],
    ]);
  }

  private showTextEditor() {
    this._state = 'edit';
    this.overlayContainer.innerHTML = '';

    this.textEditDiv = document.createElement('div');
    this.textEditDiv.style.flexGrow = '2';
    this.textEditDiv.style.alignItems = 'center';
    this.textEditDiv.style.justifyContent = 'center';
    this.textEditDiv.style.pointerEvents = 'auto';
    this.textEditDiv.style.overflow = 'hidden';

    this.textEditor = document.createElement('div');
    this.textEditor.style.position = 'absolute';
    // this.textEditor.style.width = `${this.connector.labelBackground.width.baseVal.valueAsString}px`;
    this.textEditor.style.minWidth = `80px`;
    // this.textEditor.style.height = `${this.connector.labelBackground.height.baseVal.valueAsString}px`;
    this.textEditor.style.minHeight = '1.5rem';
    // this.textEditor.style.overflowY = 'scroll';
    this.textEditor.style.textAlign = 'center';
    // @todo
    // this.textEditor.style.fontFamily = this.connector.fontFamily;
    // this.textEditor.style.color = this.stencil.color;
    this.textEditor.style.backgroundColor = 'white';
    this.textEditor.style.lineHeight = '1em';
    this.textEditor.innerText = this.connector.labelText;
    this.textEditor.contentEditable = 'true';
    this.textEditor.style.whiteSpace = 'pre';
    this.positionTextEditor();
    this.textEditor.addEventListener('pointerup', (ev) => {
      ev.stopPropagation();
    });
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

    // this.hideVisual();

    this.textEditor.focus();
    document.execCommand('selectAll');
  }

  private positionTextEditor() {
    if (this.state === 'edit') {
      if (this.textEditor === undefined) {
        this.showTextEditor();
      } else {
        this.connector.textElement.style.display = '';
        this.connector.labelBackground.style.display = '';

        this.textEditor.style.top = `${this.connector.labelBackground.y.baseVal.valueAsString}px`;
        this.textEditor.style.left = `${this.connector.labelBackground.x.baseVal.valueAsString}px`;
        this.textEditor.style.maxWidth = `2000px`;
        this.textEditor.style.maxHeight = `1000px`;
        // this.textEditor.style.maxWidth = `${this.connector.labelBackground.width}px`;
        // this.textEditor.style.maxHeight = `${this.connector.labelBackground.height}px`;
        this.textEditor.style.fontSize = `1rem`; // @todo - configurable in stencil
        this.connector.textElement.style.display = 'none';
        this.connector.labelBackground.style.display = 'none';
      }
    }
  }

  private textEditDivClicked(text: string) {
    this.connector.labelText = text.trim();
    this.overlayContainer.innerHTML = '';
    this.connector.textElement.style.display = '';
    this.connector.labelBackground.style.display = '';
    this.connector.renderText();
    this.connector.positionText();
    // this.showVisual();
    // if (this._suppressStencilCreateEvent) {
    //   this._suppressStencilCreateEvent = false;
    //   if (this.onStencilCreated) {
    //     this.onStencilCreated(this);
    //   }
    // }
  }


  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public dispose(): void {}

  public scale(scaleX: number, scaleY: number): void {
    this.connector.scale(scaleX, scaleY);
    this.adjustControlBox();
  }

  public restoreState(
    state: ConnectorBaseState,
    endPoints: ConnectorEndPoints
  ): void {
    this.connector.restoreState(state, endPoints);
    this.adjustControlBox();
    this._state = 'select';
  }
}
