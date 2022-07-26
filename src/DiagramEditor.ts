import { Button, Panel, Toolbar, ToolbarBlock } from 'mjs-toolbar';
import { IPoint } from './IPoint';
import { StencilBase } from './StencilBase';
import { StencilBaseEditor } from './StencilBaseEditor';
import { SvgHelper } from './SvgHelper';

export type DiagramEditorMode = 'select' | 'connect';

export class DiagramEditor extends HTMLElement {
  private _container?: HTMLDivElement;
  private _toolbarContainer?: HTMLDivElement;
  private _contentContainer?: HTMLDivElement;
  private _toolboxContainer?: HTMLDivElement;

  private mode: DiagramEditorMode = 'select';

  private _mainCanvas?: SVGSVGElement;
  private _groupLayer?: SVGGElement;
  private _connectorLayer?: SVGGElement;
  private _objectLayer?: SVGGElement;

  private _currentStencilEditor?: StencilBaseEditor;
  private _stencilEditors: StencilBaseEditor[] = [];

  public zoomSteps = [1, 1.5, 2, 4];
  private _zoomLevel = 1;
  public get zoomLevel(): number {
    return this._zoomLevel;
  }
  public set zoomLevel(value: number) {
    this._zoomLevel = value;
    // @todo
    // if (this.editorCanvas && this.contentDiv) {
    //   this.editorCanvas.style.transform = `scale(${this._zoomLevel})`;
    //   this.contentDiv.scrollTo({
    //     left:
    //       (this.editorCanvas.clientWidth * this._zoomLevel -
    //         this.contentDiv.clientWidth) /
    //       2,
    //     top:
    //       (this.editorCanvas.clientHeight * this._zoomLevel -
    //         this.contentDiv.clientHeight) /
    //       2,
    //   });
    // }
  }

  constructor() {
    super();

    this.stencilCreated = this.stencilCreated.bind(this);
    this.setCurrentStencil = this.setCurrentStencil.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    //this.onDblClick = this.onDblClick.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);
    //this.onKeyUp = this.onKeyUp.bind(this);
    //this.overrideOverflow = this.overrideOverflow.bind(this);
    //this.restoreOverflow = this.restoreOverflow.bind(this);
    //this.close = this.close.bind(this);
    //this.closeUI = this.closeUI.bind(this);
    this.clientToLocalCoordinates = this.clientToLocalCoordinates.bind(this);
    // this.onWindowResize = this.onWindowResize.bind(this);

    this.attachShadow({ mode: 'open' });
  }

  private createLayout() {
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';

    this._container = document.createElement('div');
    this._container.style.display = 'flex';
    this._container.style.flexDirection = 'column';
    this._container.style.width = '100%';
    this._container.style.height = '100%';
    this._container.style.backgroundColor = 'green';

    this._toolbarContainer = document.createElement('div');
    this._toolbarContainer.style.display = 'flex';
    this._toolbarContainer.style.backgroundColor = 'red';
    this._container.appendChild(this._toolbarContainer);

    this._contentContainer = document.createElement('div');
    this._contentContainer.style.display = 'flex';
    this._contentContainer.style.flexGrow = '2';
    this._contentContainer.style.flexShrink = '1';
    this._contentContainer.style.backgroundColor = 'magenta';
    this._container.appendChild(this._contentContainer);

    this._toolboxContainer = document.createElement('div');
    this._toolboxContainer.style.display = 'flex';
    this._toolboxContainer.style.backgroundColor = 'cyan';
    this._container.appendChild(this._toolboxContainer);

    this._container.setAttribute('part', 'container');

    this.shadowRoot?.appendChild(this._container);
  }

  private addToolbar() {
    const panel = <Panel>document.createElement('mjstb-panel');

    const toolbar = new Toolbar();
    toolbar.addEventListener('buttonclick', (ev) => {
      this.createNewStencil(typeof StencilBase);
      console.log(`'${ev.detail.button.command}' button clicked.`)
    });

    const block1 = new ToolbarBlock();
    const block2 = new ToolbarBlock();
    const block3 = new ToolbarBlock();

    const checkSVG = `<svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
    </svg>`;

    const button11 = new Button({ icon: checkSVG, command: 'run' });
    block1.appendButton(button11);
    const button12 = new Button({ icon: checkSVG, command: 'for' });
    block1.appendButton(button12);
    const button13 = new Button({ icon: checkSVG, command: 'cover' });
    block1.appendButton(button13);

    const button21 = new Button({ text: 'click me', command: 'text' });
    block2.appendButton(button21);
    const button22 = new Button({ icon: checkSVG });
    block2.appendButton(button22);

    toolbar.appendBlock(block1);
    toolbar.appendBlock(block2);
    toolbar.appendBlock(block3);

    panel.appendToolbar(toolbar);

    this._toolbarContainer?.appendChild(panel);
  }

  private addMainCanvas() {
    const w = this._contentContainer?.clientWidth || 0;
    const h = this._contentContainer?.clientHeight || 0;

    this._mainCanvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    this._mainCanvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this._mainCanvas.setAttribute('width', w.toString());
    this._mainCanvas.setAttribute('height', h.toString());
    this._mainCanvas.setAttribute(
      'viewBox',
      '0 0 ' + w.toString() + ' ' + h.toString()
    );
    this._mainCanvas.style.pointerEvents = 'auto';

    this._groupLayer = SvgHelper.createGroup();
    this._connectorLayer = SvgHelper.createGroup();
    this._objectLayer = SvgHelper.createGroup();

    this._mainCanvas.appendChild(this._groupLayer);
    this._mainCanvas.appendChild(this._connectorLayer);
    this._mainCanvas.appendChild(this._objectLayer);

    this._contentContainer?.appendChild(this._mainCanvas);
  }

  private connectedCallback() {
    this.createLayout();
    this.addToolbar();
    this.addMainCanvas();
    this.attachEvents();
  }

  private disconnectedCallback() {
    this.detachEvents();
  }

  private attachEvents() {
    this._mainCanvas?.addEventListener('pointerdown', this.onPointerDown);
    // @todo
    // this._mainCanvas?.addEventListener('dblclick', this.onDblClick);
    this.attachWindowEvents();
  }

  private attachWindowEvents() {
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerOut);
    window.addEventListener('pointerout', this.onPointerOut);
    window.addEventListener('pointerleave', this.onPointerUp);
    // @todo
    // window.addEventListener('resize', this.onWindowResize);
    // window.addEventListener('keyup', this.onKeyUp);
  }

  private detachEvents() {
    this._mainCanvas?.removeEventListener('pointerdown', this.onPointerDown);
    // @todo
    // this._mainCanvas?.removeEventListener('dblclick', this.onDblClick);
    this.detachWindowEvents();
  }

  private detachWindowEvents() {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerOut);
    window.removeEventListener('pointerout', this.onPointerOut);
    window.removeEventListener('pointerleave', this.onPointerUp);
    // @todo
    // window.removeEventListener('resize', this.onWindowResize);
    // window.removeEventListener('keyup', this.onKeyUp);
  }

  private clientToLocalCoordinates(x: number, y: number): IPoint {
    if (this._mainCanvas) {
      const clientRect = this._mainCanvas.getBoundingClientRect();
      return {
        x: (x - clientRect.left) / this.zoomLevel,
        y: (y - clientRect.top) / this.zoomLevel,
      };
    } else {
      return { x: x, y: y };
    }
  }

  private touchPoints = 0;
  private isDragging = false;

  private onPointerDown(ev: PointerEvent) {
    // @todo
    // if (!this._isFocused) {
    //   this.focus();
    // }

    this.touchPoints++;
    if (this.touchPoints === 1 || ev.pointerType !== 'touch') {
      if (
        this._currentStencilEditor !== undefined &&
        (this._currentStencilEditor.state === 'new' ||
          this._currentStencilEditor.state === 'creating')
      ) {
        this.isDragging = true;
        this._currentStencilEditor.pointerDown(
          this.clientToLocalCoordinates(ev.clientX, ev.clientY)
        );
      }
      else if (this.mode === 'select' && ev.target) {
        const hitEditor = this._stencilEditors.find((m) => m.ownsTarget(ev.target));
        if (hitEditor !== undefined) {
          this.setCurrentStencil(hitEditor);
          this.isDragging = true;
          this._currentStencilEditor?.pointerDown(
            this.clientToLocalCoordinates(ev.clientX, ev.clientY),
            ev.target
          );
        } else {
          this.setCurrentStencil();
          this.isDragging = true;
          // @todo
          // this.prevPanPoint = { x: ev.clientX, y: ev.clientY };
        }
      }
    }
  }

  private onPointerMove(ev: PointerEvent) {
    if (this.touchPoints === 1 || ev.pointerType !== 'touch') {
      if (this._currentStencilEditor !== undefined || this.isDragging) {
        // don't swallow the event when editing text
        if (
          this._currentStencilEditor === undefined ||
          this._currentStencilEditor.state !== 'edit'
        ) {
          ev.preventDefault();
        }

        if (this._currentStencilEditor !== undefined) {
          this._currentStencilEditor.manipulate(
            this.clientToLocalCoordinates(ev.clientX, ev.clientY)
          );
        }
        // @todo - handle zoomed state
        // else if (this.zoomLevel > 1) {
        //   this.panTo({ x: ev.clientX, y: ev.clientY });
        // }
      }
    }
  }
  private onPointerUp(ev: PointerEvent) {
    if (this.touchPoints > 0) {
      this.touchPoints--;
    }
    if (this.touchPoints === 0) {
      if (this.isDragging && this._currentStencilEditor !== undefined) {
        this._currentStencilEditor.pointerUp(
          this.clientToLocalCoordinates(ev.clientX, ev.clientY)
        );
      }
    }
    this.isDragging = false;
    // @todo
    // this.addUndoStep();
  }

  private onPointerOut(/*ev: PointerEvent*/) {
    if (this.touchPoints > 0) {
      this.touchPoints--;
    }
  }

  public createNewStencil(steniclType: typeof StencilBase | string): void {
    let sType: typeof StencilBase;

    if (typeof steniclType === 'string') {
      sType = StencilBase; // @todo remove hardcoded
      // @todo implement search
      // mType = this._availableMarkerTypes.find(
      //   (mt) => mt.typeName === markerType
      // );
    } else {
      sType = steniclType;
    }

    if (sType) {
      this.setCurrentStencil();
      // @todo
      // this.addUndoStep();
      this._currentStencilEditor = this.addNewStencil(sType);
      this._currentStencilEditor.onStencilCreated = this.stencilCreated;
      if (this._mainCanvas) {
        this._mainCanvas.style.cursor = 'crosshair';
      }
      // @todo
      // this.toolbar.setActiveMarkerButton(mType.typeName);
      // this.toolbox.setPanelButtons(this.currentMarker.toolboxPanels);
      // this.eventListeners['markercreating'].forEach((listener) =>
      //   listener(new MarkerEvent(this, this.currentMarker))
      // );
    }
  }

  private stencilCreated(stencilEditor: StencilBaseEditor) {
    this.mode = 'select';
    if (this._mainCanvas) {
      this._mainCanvas.style.cursor = 'default';
    }
    this._stencilEditors.push(stencilEditor);
    this.setCurrentStencil(stencilEditor);

    // @todo
    // this.toolbar.setSelectMode();
    // this.addUndoStep();
    // this.eventListeners['markercreate'].forEach((listener) =>
    //   listener(new MarkerEvent(this, this.currentMarker))
    // );
  }

  public setCurrentStencil(stencilEditor?: StencilBaseEditor): void {
    if (this._currentStencilEditor !== stencilEditor) {
      // no need to deselect if not changed
      if (this._currentStencilEditor !== undefined) {
        this._currentStencilEditor.deselect();
        // @todo
        // this.toolbar.setCurrentMarker();
        // this.toolbox.setPanelButtons([]);
        // @todo
        // if (!this._isResizing) {
        //   this.eventListeners['markerdeselect'].forEach((listener) =>
        //     listener(new MarkerEvent(this, this.currentMarker))
        //   );
        // }
      }
    }
    this._currentStencilEditor = stencilEditor;
    if (this._currentStencilEditor !== undefined && !this._currentStencilEditor.isSelected) {
      if (this._currentStencilEditor.state !== 'new') {
      this._currentStencilEditor.select();
      }
      // @todo
      // this.toolbar.setCurrentMarker(this.currentMarker);
      // this.toolbox.setPanelButtons(this.currentMarker.toolboxPanels);

      // if (!this._isResizing) {
      //   this.eventListeners['markerselect'].forEach((listener) =>
      //     listener(new MarkerEvent(this, this.currentMarker))
      //   );
      // }
    }
  }

  private addNewStencil(stencilType: typeof StencilBase): StencilBaseEditor {
    const g = SvgHelper.createGroup();
    this._objectLayer?.appendChild(g);

    return new StencilBaseEditor(
      g,
      document.createElement('div') /* @todo this.overlayContainer */,
      stencilType,
    );
  }
}
