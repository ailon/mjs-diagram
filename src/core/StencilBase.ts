import { DiagramSettings } from './DiagramSettings';
import { IPoint } from './IPoint';
import { ISize } from './ISize';
import { Port, PortLocation } from './Port';
import { StencilBaseState } from './StencilBaseState';
import { SvgHelper } from './SvgHelper';

/**
 * The `StencilBase` class is the base class for all stencil types in MJS Diagram.
 * 
 * It covers the basic functionality and APIs for all other stencil types.
 */
export class StencilBase {
  /**
   * A string representation of the type used
   * in diagram configuration (state) JSON.
   */  
  public static typeName = 'StencilBase';

   /**
   * A string representation of the type used
   * in diagram configuration (state) JSON.
   * 
   * @remarks
   * Instance accessor returning the value of static {@link typeName}.
   */   
  public get typeName(): string {
    return Object.getPrototypeOf(this).constructor.typeName;
  }

  /**
   * Default name of the stencil.
   */
  public static title: string;

  /**
   * Returns the main SVG path of the stencil's visual. 
   * It is used in thumbnails in  the editor and, potentially, other places.
   * @param width target width
   * @param height target height
   * @returns SVG path string 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected static getPathD(width: number, height: number): string {
    return 'M0,0';
  }

  private _iid: number;
  /**
   * Internal stencil identifier used in state/configuration JSON
   * as reference to this stencil.
   */  
  public get IId(): number {
    return this._iid;
  }

  /**
   * Top level SVG container (group) encapsulating all the visual elements of this stencil.
   */
  protected _container: SVGGElement;
  /**
   * {@inheritDoc _container}
   */
  public get container(): SVGGElement {
    return this._container;
  }

  private _settings: DiagramSettings;
  /**
   * Settings for the whole diagram.
   */
  protected get settings(): DiagramSettings {
    return this._settings;
  }

  /**
   * Store any arbitrary string information associated with this stencil in this field.
   */
  public notes?: string;

  /**
   * Fired when the stencil creation is completed.
   * @group Events
   */
  public onStencilCreated?: (stencil: StencilBase) => void;

  /**
   * Default size of the stencil when created.
   * 
   * @remarks
   * Override in the descendant stencils to set a size that makes sense for the stencil type.
   */
  protected _defaultSize: ISize = { width: 120, height: 70 }
  /**
   * Returns the default size of the stencil.
   */
  public get defaultSize(): ISize {
    return this._defaultSize;
  }
  /**
   * Sets the default and updates the current stencil size. 
   */
  public set defaultSize(value: ISize) {
    this._defaultSize = value;
    this.width = value.width;
    this.height = value.height;
  }

  /**
   * Left (x) coordinate of the stencil.
   */
  public left = 0;
  /**
   * Top (y) coordinate of the stencil.
   */
  public top = 0;
  /**
   * Stencil width.
   */
  public width = this._defaultSize.width;
  /**
   * Stencil height.
   */
  public height = this._defaultSize.height;
  /**
   * Returns the right edge (x) coordinate (calculated).
   */
  public get right(): number {
    return this.left + this.width;
  }
  /**
   * Returns the bottom edge (y) coordinate (calculated)
   */
  public get bottom(): number {
    return this.top + this.height;
  }

  /**
   * Returns the stencil center X coordinate (calculated).
   */
  protected get centerX(): number {
    return this.left + this.width / 2;
  }
  /**
   * Returns the stencil center Y coordinate (calculated).
   */
  protected get centerY(): number {
    return this.top + this.height / 2;
  }

  /**
   * Stencil's frame path for selection. Usually an extended (wider) version of the {@link _frame}.
   */
  protected _selectorFrame?: SVGElement;
  /**
   * Stencil's frame path. Usually the main stencil visual.
   */
  protected _frame?: SVGElement;

  // @todo: proper initializer needed or accept undefined?
  private _visual: SVGGraphicsElement = SvgHelper.createGroup();
  /**
   * Returns the SVG group holding the stencil's visual.
   */
  protected get visual(): SVGGraphicsElement {
    return this._visual;
  }
  /**
   * Sets the stencil's visual.
   */
  // @todo doesn't seem to be used anywhere. is it needed?
  protected set visual(value: SVGGraphicsElement) {
    this._visual = value;
    const translate = SvgHelper.createTransform();
    this._visual.transform.baseVal.appendItem(translate);
  }

  /**
   * Stencil's fill color.
   */
  protected _fillColor = '#eeeeee';
  /**
   * Returns stencil's fill color.
   */
  public get fillColor() {
    return this._fillColor;
  }
  /**
   * Stencil's outline (stroke) color.
   */
  protected _strokeColor = 'black';
  /**
   * Returns stencil's outline (stroke) color.
   */
  public get strokeColor() {
    return this._strokeColor;
  }
  /**
   * Stencil's outline (stroke) width in pixels.
   */
  protected _strokeWidth = 1;
  /**
   * Returns stencil's outline (stroke) width in pixels.
   */
  public get strokeWidth() {
    return this._strokeWidth;
  }
  /**
   * Stencil's outline dash array.
   * 
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   */
  protected _strokeDasharray = '';
  /**
   * Returns stencil's outline dash array.
   * 
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   */
  public get strokeDasharray() {
    return this._strokeDasharray;
  }

  /**
   * Holds a collection of connector ports for this stencil.
   */
  public ports = new Map<PortLocation, Port>([
    ['topleft', new Port('topleft')],
    ['topcenter', new Port('topcenter')],
    ['topright', new Port('topright')],
    ['leftcenter', new Port('leftcenter')],
    ['rightcenter', new Port('rightcenter')],
    ['bottomleft', new Port('bottomleft')],
    ['bottomcenter', new Port('bottomcenter')],
    ['bottomright', new Port('bottomright')],
  ]);

  /**
   * Specifies whether stencil's fill can be changed by the user.
   */
  public fillEditable = true;
  /**
   * Specifies whether stencil's stroke properties can be changed by the user.
   */
  public strokeEditable = true;

  /**
   * Creates a stencil object.
   * @param iid internal stencil identifier
   * @param container SVG container for all the stencil's visuals
   * @param settings settings for the whole diagram
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    this._iid = iid;
    this._container = container;
    this._settings = settings;

    this.getPathD = this.getPathD.bind(this);
    this.getSelectorPathD = this.getSelectorPathD.bind(this);

    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.setFillColor = this.setFillColor.bind(this);
    this.setStrokeWidth = this.setStrokeWidth.bind(this);
    this.setStrokeDasharray = this.setStrokeDasharray.bind(this);
    this.createVisual = this.createVisual.bind(this);
    this.createSelector = this.createSelector.bind(this);
    this.adjustSelector = this.adjustSelector.bind(this);
    this.adjustVisual = this.adjustVisual.bind(this);

    this._strokeColor = this.settings.getColor(this.typeName, 'stroke');
    this._fillColor = this.settings.getColor(this.typeName, 'fill');
    this.setStrokeWidth(this.settings.getStrokeWidth(this.typeName));
    this._strokeDasharray = this.settings.getDashArray(this.typeName);
  }

  /**
   * Returns the base thumbnail SVG image scaffolding (SVG image element).
   * @param width image width
   * @param height image height
   * @returns SVG image element
   */
  protected static getThumbnailSVG(
    width: number,
    height: number
  ): SVGSVGElement {
    const result = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    result.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    result.setAttribute('width', width.toString());
    result.setAttribute('height', height.toString());
    result.setAttribute(
      'viewBox',
      '0 0 ' + width.toString() + ' ' + height.toString()
    );

    return result;
  }

  /**
   * Returns a simplified thumbnail representation of the stencil as an SVG image.
   * It is used by the editor and can potentially be used in other places.
   * @param width image width
   * @param height image height
   * @returns thumbnail as an SVG image
   */
  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const result = StencilBase.getThumbnailSVG(width, height);

    const pathD = this.getPathD(width, height);
    if (pathD && pathD.length > 0) {
      const frame = SvgHelper.createPath(pathD);
      result.appendChild(frame);
    }

    return result;
  }

  /**
   * Returns true if supplied element is a part of this stencil.
   * @param el target element
   * @returns `true` if the element if part of this stencil, `false` otherwise.
   */
  public ownsTarget(el: EventTarget): boolean {
    if (
      el === this.visual ||
      el === this._frame ||
      el === this._selectorFrame
    ) {
      return true;
    } else {
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public dispose(): void {}

  /**
   * Scales the stencil according to supplied scale factors.
   * @param scaleX horizontal scale factor
   * @param scaleY vertical scale factor
   */
  public scale(scaleX: number, scaleY: number): void {
    this.left = this.left * scaleX;
    this.top = this.top * scaleY;
    this.width = this.width * scaleX;
    this.height = this.height * scaleY;

    this.setSize();
  }

  /**
   * Disables connector ports in specified locations
   * @remarks
   * By default all ports are enabled. Depending on the stencil type it makes
   * sense to disable some (or even all) of the ports.
   *  
   * For example {@link core!DiamondStencil} has all the corner ports disabled
   * as the stencil visual has no visible parts there.
   * @param portLocations locations of the ports to disable.
   */
  public disablePorts(...portLocations: PortLocation[]): void {
    if (portLocations && portLocations.length > 0) {
      portLocations.forEach((pl) => {
        const port = this.ports.get(pl);
        if (port !== undefined) {
          port.enabled = false;
        }
      });
    }
  }
  
  /**
   * Instance method for getting the stencil path. Calls the static {@link getPathD}.
   * @param width bounding width
   * @param height bounding height
   * @returns stencil's SVG path string
   */
  protected getPathD(width: number, height: number): string {
    return Object.getPrototypeOf(this).constructor.getPathD(width, height);
  }

  /**
   * Gets stencil's SVG path for the purpose of reacting to pointer and other events.
   * 
   * @remarks
   * Some stencil types may have a visual that is very narrow or otherwise hard
   * to hit with a pointer. This method provides a way to get an alternative invisible
   * path that is easier to hit resulting in better user experience.
   * 
   * By default it returns the same path as the {@link core!StencilBase#getPathD | main stencil path} though.
   * @param width target width
   * @param height target height
   * @returns SVG path string
   */
  public getSelectorPathD(width: number, height: number): string {
    return this.getPathD(width, height);
  }

  /**
   * Creates an invisible visual that acts as a more pronounced hit target
   * that is easier to hit with a pointer.
   */
  protected createSelector(): void {
    const pathString = this.getSelectorPathD(
      this.defaultSize.width,
      this.defaultSize.height
    );
    if (pathString && pathString.length > 0) {
      this._selectorFrame = SvgHelper.createPath(pathString, [
        ['fill', 'transparent'],
        ['stroke', 'transparent'],
        ['stroke-width', '15px'],
      ]);
      this.visual.appendChild(this._selectorFrame);
    }
  }

  /**
   * Creates the main stencil's visual.
   */
  public createVisual(): void {
    this.createSelector();
    const pathString = this.getPathD(
      this.defaultSize.width,
      this.defaultSize.height
    );
    if (pathString && pathString.length > 0) {
      this._frame = SvgHelper.createPath(pathString, [
        ['fill', this._fillColor],
        ['stroke', this._strokeColor],
        ['stroke-width', this.strokeWidth.toString()],
        ['stroke-dasharray', this.strokeDasharray],
      ]);
      this.visual.appendChild(this._frame);
      this.addVisualToContainer(this.visual);
    }
  }

  /**
   * Inserts the supplied element as the first child of the container. 
   * @param element SVG element to insert
   */
  protected addVisualToContainer(element: SVGElement): void {
    if (this.container.childNodes.length > 0) {
      this.container.insertBefore(element, this.container.childNodes[0]);
    } else {
      this.container.appendChild(element);
    }
  }

  /**
   * Moves the stencil visual to the specified coordinates.
   * @param point new stencil coordinates
   */
  public moveVisual(point: IPoint): void {
    this.visual.style.transform = `translate(${point.x}px, ${point.y}px)`;
  }

  /**
   * Adjusts selector visual based on current stencil dimensions.
   */
  protected adjustSelector() {
    if (this._selectorFrame !== undefined) {
      SvgHelper.setAttributes(this._selectorFrame, [
        ['d', this.getSelectorPathD(this.width, this.height)],
      ]);
    }
  }

  /**
   * Adjusts stencil visual based on current dimensions.
   */
  protected adjustVisual() {
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [
        ['d', this.getPathD(this.width, this.height)],
      ]);
    }
  }

  /**
   * Adjusts the stencil to current size and location.
   */
  public setSize(): void {
    this.moveVisual({ x: this.left, y: this.top });
    this.adjustSelector();
    this.adjustVisual();
  }

  /**
   * Sets the stencil's outline (stroke) color.
   * @param color new color
   */
  public setStrokeColor(color: string): void {
    this._strokeColor = color;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [['stroke', this._strokeColor]]);
    }
  }
  /**
   * Sets the stencil's fill color.
   * @param color new color
   */
  public setFillColor(color: string): void {
    this._fillColor = color;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [['fill', this._fillColor]]);
    }
  }
  /**
   * Sets the stencil's outline (stroke) width in pixels
   * @param width new width
   */
  public setStrokeWidth(width: number | string): void {
    const numWidth = typeof(width) === 'string' ? Number.parseFloat(width) : width;
    this._strokeWidth = numWidth;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [
        ['stroke-width', this.strokeWidth.toString()],
      ]);
    }
  }
  /**
   * Sets the stencil outline's dash array.
   * 
   * @param dashes new dash array 
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   */
  public setStrokeDasharray(dashes: string): void {
    this._strokeDasharray = dashes;
    if (this._frame !== undefined) {
      SvgHelper.setAttributes(this._frame, [
        ['stroke-dasharray', this.strokeDasharray],
      ]);
    }
  }

  /**
   * Returns coordinates for the port in specified location
   * @param location port location
   * @returns port center coordinates
   */
  public getPortPosition(location: PortLocation): IPoint {
    const port = this.ports.get(location);
    const result: IPoint = {
      x: this.left + (port?.x || 0),
      y: this.top + (port?.y || 0),
    };

    return result;
  }

  /**
   * Positions all ports in their respective locations.
   */
  public positionPorts(): void {
    const left = 0;
    const top = left;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const bottom = this.height;
    const right = this.width;

    this.positionPort(this.ports.get('topleft'), left, top);
    this.positionPort(this.ports.get('topcenter'), cx, top);
    this.positionPort(this.ports.get('topright'), right, top);
    this.positionPort(this.ports.get('leftcenter'), left, cy);
    this.positionPort(this.ports.get('rightcenter'), right, cy);
    this.positionPort(this.ports.get('bottomleft'), left, bottom);
    this.positionPort(this.ports.get('bottomcenter'), cx, bottom);
    this.positionPort(this.ports.get('bottomright'), right, bottom);
  }

  /**
   * Positions the supplied port in specified location.
   * @param port port to position
   * @param x horizontal position
   * @param y vertical position
   */
  private positionPort(port: Port | undefined, x: number, y: number) {
    if (port !== undefined) {
      port.x = x;
      port.y = y;
    }
  }

  /**
   * Returns stencil state (configuration) used to save the whole diagram for future use
   * as well as for undo/redo operations.
   * @returns stencil state object
   */
  public getState(): StencilBaseState {
    return {
      typeName: this.typeName,
      iid: this.IId,
      notes: this.notes,

      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,

      fillColor: this._fillColor,
      strokeColor: this._strokeColor,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray,
    };
  }

  /**
   * Restores stencil configuration (settings) from a previously saved state.
   * @param state previously saved state object.
   */
  public restoreState(state: StencilBaseState): void {
    this._iid = state.iid;
    this.notes = state.notes;

    this.left = state.left;
    this.top = state.top;
    if (state.width !== undefined) {
      this.width = state.width;
    }
    if (state.height !== undefined) {
      this.height = state.height;
    }
    if (state.fillColor !== undefined) {
      this._fillColor = state.fillColor;
    }
    if (state.strokeColor !== undefined) {
      this._strokeColor = state.strokeColor;
    }
    if (state.strokeWidth !== undefined) {
      this._strokeWidth = state.strokeWidth;
    }
    if (state.strokeDasharray !== undefined) {
      this._strokeDasharray = state.strokeDasharray;
    }

    this.createVisual();
    this.setSize();
    this.positionPorts();
  }
}
