import { GripLocation, ResizeGrip } from './ResizeGrip';
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';

export class StencilBaseEditor<T extends StencilBase> {
  // @todo switch type to use the generic
  protected _stencilType: typeof StencilBase;
  protected _stencil?: T;

  protected _container: SVGGElement;
  public get container(): SVGGElement {
    return this._container;
  }

  protected _overlayContainer: HTMLDivElement;
  public get overlayContainer(): HTMLDivElement {
    return this._overlayContainer;
  }

  protected resizeGrips = new Map<GripLocation, ResizeGrip>([
    ['topleft', new ResizeGrip()],
    ['topcenter', new ResizeGrip()],
    ['topright', new ResizeGrip()],
    ['leftcenter', new ResizeGrip()],
    ['rightcenter', new ResizeGrip()],
    ['bottomleft', new ResizeGrip()],
    ['bottomcenter', new ResizeGrip()],
    ['bottomright', new ResizeGrip()],
  ]);
  protected activeGrip?: ResizeGrip;

  protected _controlBox = SvgHelper.createGroup();
  private readonly CB_DISTANCE: number = 10;
  private _controlRect?: SVGRectElement;

  constructor(
    container: SVGGElement,
    overlayContainer: HTMLDivElement,
    stencilType: typeof StencilBase,
    stencil?: T
  ) {
    this._container = container;
    this._overlayContainer = overlayContainer;
    this._stencilType = stencilType;
    this._stencil = stencil;
  }

  public ownsTarget(el: EventTarget): boolean {
    if (this._stencil?.ownsTarget(el)) {
      return true;
    } else {
      let found = false;
      this.resizeGrips.forEach((grip) => {
        if (grip.ownsTarget(el)) {
          found = true;
        }
      });
      return found;
    }
  }

  private setupControlBox() {
    if (this._stencil !== undefined) {
      //this._controlBox = SvgHelper.createGroup();
      const translate = SvgHelper.createTransform();
      translate.setTranslate(-this.CB_DISTANCE / 2, -this.CB_DISTANCE / 2);
      this._controlBox.transform.baseVal.appendItem(translate);

      this.container.appendChild(this._controlBox);

      this._controlRect = SvgHelper.createRect(
        this._stencil.width + this.CB_DISTANCE,
        this._stencil.height + this.CB_DISTANCE,
        [
          ['stroke', 'black'],
          ['stroke-width', '1'],
          ['stroke-opacity', '0.5'],
          ['stroke-dasharray', '3, 2'],
          ['fill', 'transparent'],
          ['pointer-events', 'none'],
        ]
      );

      this._controlBox.appendChild(this._controlRect);

      this.addResizeGrips();

      this._controlBox.style.display = 'none';
    }
  }

  private addResizeGrips() {
    this.resizeGrips.forEach((grip) => {
      if (grip.enabled) {
        grip.visual.transform.baseVal.appendItem(SvgHelper.createTransform());
        this._controlBox.appendChild(grip.visual);
      }
    });

    this.positionGrips();
  }

  private positionGrips() {
    if (this._stencil) {
      const gripSize = this.resizeGrips.get('topleft')?.GRIP_SIZE || 10;

      const left = -gripSize / 2;
      const top = left;
      const cx = (this._stencil.width + this.CB_DISTANCE) / 2 - gripSize / 2;
      const cy = (this._stencil.height + this.CB_DISTANCE) / 2 - gripSize / 2;
      const bottom = this._stencil.height + this.CB_DISTANCE - gripSize / 2;
      const right = this._stencil.width + this.CB_DISTANCE - gripSize / 2;

      this.positionGrip(this.resizeGrips.get('topleft')?.visual, left, top);
      this.positionGrip(this.resizeGrips.get('topcenter')?.visual, cx, top);
      this.positionGrip(this.resizeGrips.get('topright')?.visual, right, top);
      this.positionGrip(this.resizeGrips.get('leftcenter')?.visual, left, cy);
      this.positionGrip(this.resizeGrips.get('rightcenter')?.visual, right, cy);
      this.positionGrip(
        this.resizeGrips.get('bottomleft')?.visual,
        left,
        bottom
      );
      this.positionGrip(
        this.resizeGrips.get('bottomcenter')?.visual,
        cx,
        bottom
      );
      this.positionGrip(
        this.resizeGrips.get('bottomright')?.visual,
        right,
        bottom
      );
    }
  }

  private positionGrip(
    grip: SVGGraphicsElement | undefined,
    x: number,
    y: number
  ) {
    if (grip !== undefined) {
      const translate = grip.transform.baseVal.getItem(0);
      translate.setTranslate(x, y);
      grip.transform.baseVal.replaceItem(translate, 0);
    }
  }

  protected hideControlBox(): void {
    this._controlBox.style.display = 'none';
  }
  protected showControlBox(): void {
    this._controlBox.style.display = '';
  }

  private adjustControlBox() {
    if (this._stencil !== undefined) {
      const translate = this._controlBox.transform.baseVal.getItem(0);
      translate.setTranslate(
        this._stencil.left - this.CB_DISTANCE / 2,
        this._stencil.top - this.CB_DISTANCE / 2
      );
      this._controlBox.transform.baseVal.replaceItem(translate, 0);
      this._controlRect?.setAttribute(
        'width',
        (this._stencil.width + this.CB_DISTANCE).toString()
      );
      this._controlRect?.setAttribute(
        'height',
        (this._stencil.height + this.CB_DISTANCE).toString()
      );
      this.positionGrips();
    }
  }

  public scale(scaleX: number, scaleY: number): void {
    this._stencil?.scale(scaleX, scaleY);

    this.adjustControlBox();
  }
}
