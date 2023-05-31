import { ConnectorBaseState, ConnectorEndPoints } from './ConnectorBaseState';
import { DiagramSettings } from './DiagramSettings';
import { IPoint } from './IPoint';
import { Port } from './Port';
import { StencilBase } from './StencilBase';
import { SvgHelper } from './SvgHelper';
import { TextBlock } from './TextBlock';

/**
 * Defines location of arrows on a connector.
 * 
 * - `both` - arrows displayed on both ends of a connector.
 * - `start` - arrow displayend on the start side of a connector.
 * - `end` - arrow displayed on the end side of a connector.
 * - `none` - no arrows are displayed.
 */
export type ArrowType = 'both' | 'start' | 'end' | 'none';

/**
 * Represents the base type for all connectors in MJS Diagram.
 */
export class ConnectorBase {
  /**
   * A string representation of the type used
   * in diagram configuration (state) JSON.
   */
  public static typeName = 'ConnectorBase';

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

  private _iid: number;
  /**
   * Internal connector identifier used in state/configuration JSON
   * as reference to this connector.
   */
  public get IId(): number {
    return this._iid;
  }

  /**
   * SVG group containing all the SVG elements for this connector.
   */
  public container: SVGGElement;

  /**
   * Reference to the stencil at the start tip of this connector.
   */
  public startStencil?: StencilBase;
  /**
   * Reference to the stencil connector port and the start tip of this connector.
   */
  public startPort?: Port;
  /**
   * Reference to the stencil at the end tip of this connector.
   */
  public endStencil?: StencilBase;
  /**
   * Reference to the stencil connector port and the end tip of this connector.
   */
  public endPort?: Port;

  /**
   * X coordinate of the start tip.
   */
  public x1 = 0;
  /**
   * Y coordinate of the start tip.
   */
  public y1 = 0;
  /**
   * X coordinate of the end tip.
   */
  public x2 = 0;
  /**
   * Y coordinate of the end tip.
   */
  public y2 = 0;

  /**
   * The top level SVG element (group) of the connector's visual.
   */
  public visual: SVGGraphicsElement = SvgHelper.createGroup();

  /**
   * Visible connector line.
   */
  public visibleLine!: SVGLineElement | SVGPathElement;
  /**
   * Invisible wider connector line used to improve selection accuracy.
   */
  public selectorLine!: SVGLineElement | SVGPathElement;
  /**
   * Connector line color.
   */
  public strokeColor = '#000';
  /**
   * Connector line width.
   */
  public strokeWidth = 1;
  /**
   * Connector line dash array.
   */
  public strokeDasharray = '';

  // @todo why public?
  public _labelText = '';
  /**
   * Gets label text for the connector.
   */
  public get labelText(): string {
    return this.textBlock.text;
  }
  /**
   * Sets label text for the connector.
   */
  public set labelText(value: string) {
    this._labelText = value;
    this.textBlock.text = this._labelText;
  }

  /**
   * Text block displaying the connector label.
   */
  public textBlock: TextBlock = new TextBlock();

  /**
   * Bounding box for the label text.
   */
  public textBoundingBox = new DOMRect();

  /**
   * SVG polygon for the start tip arrow.
   */
  protected arrow1!: SVGPolygonElement;
  /**
   * SVG polygon for the end tip arrow.
   */
  protected arrow2!: SVGPolygonElement;

  /**
   * {@inheritDoc core!ArrowType}
   */
  public arrowType: ArrowType = 'none';

  /**
   * Arrow height.
   */
  protected arrowBaseHeight = 10;
  /**
   * Arrow width.
   */
  protected arrowBaseWidth = 10;

  /**
   * Returns connector thumbnail used to define the shape of the connector in the {@link editor!DiagramEditor}.
   * @param width - thumbnail image width
   * @param height - thumbnail image height
   * @returns SVG image of the thumbnail.
   */
  public static getThumbnail(width: number, height: number): SVGSVGElement {
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

    const xPadding = Math.max(Math.floor(width * 0.05), 2);
    const yPadding = Math.max(Math.floor(height * 0.05), 2);

    const line = SvgHelper.createLine(
      xPadding,
      yPadding,
      width - xPadding,
      height - xPadding,
      [['stroke-width', Math.max(Math.round(width / 20), 2).toString()]]
    );

    result.appendChild(line);

    return result;
  }

  private _settings: DiagramSettings;
  /**
   * {@link core!DiagramSettings} of the whole diagram.
   */
  protected get settings(): DiagramSettings {
    return this._settings;
  }

  /**
   * Creates a connector.
   * @param iid - connector identifier.
   * @param container - SVG container to contain all the connector visuals.
   * @param settings - whole diagram settings.
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    this._iid = iid;
    this.container = container;
    this._settings = settings;

    this.ownsTarget = this.ownsTarget.bind(this);
    this.createVisual = this.createVisual.bind(this);
    this.createCoreVisual = this.createCoreVisual.bind(this);
    this.adjustVisual = this.adjustVisual.bind(this);
    this.addVisualToContainer = this.addVisualToContainer.bind(this);

    this.adjust = this.adjust.bind(this);
    this.adjustPoints = this.adjustPoints.bind(this);
    this.setStartPosition = this.setStartPosition.bind(this);
    this.setEndPosition = this.setEndPosition.bind(this);
    this.setTextBoundingBox = this.setTextBoundingBox.bind(this);
    this.moveLabel = this.moveLabel.bind(this);
    this.getArrowPoints = this.getArrowPoints.bind(this);
    this.createTips = this.createTips.bind(this);
    this.adjustTips = this.adjustTips.bind(this);
    this.rotateArrows = this.rotateArrows.bind(this);
    this.getEnding = this.getEnding.bind(this);
    this.getEndings = this.getEndings.bind(this);

    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.setArrowType = this.setArrowType.bind(this);

    this.scale = this.scale.bind(this);
    this.getState = this.getState.bind(this);
    this.restoreState = this.restoreState.bind(this);
  }

  /**
   * Returns true if manipulation target belongs to this connector.
   */
  public ownsTarget(el: EventTarget): boolean {
    return (
      el === this.visual ||
      el === this.selectorLine ||
      el === this.visibleLine ||
      this.textBlock.ownsTarget(el)
    );
  }

  /**
   * Creates visual elements of the connector.
   */
  public createVisual() {
    this.createCoreVisual();

    this.createTips();

    this.visual.appendChild(this.textBlock.labelBackground);

    this.visual.appendChild(this.textBlock.textElement);

    this.addVisualToContainer(this.visual);
  }

  /**
   * Creates the main visual of the connector.
   */
  public createCoreVisual() {
    this.selectorLine = SvgHelper.createLine(
      this.x1,
      this.y1,
      this.x2,
      this.y2,
      [
        ['stroke', 'transparent'],
        ['stroke-width', (this.strokeWidth + 10).toString()],
      ]
    );
    this.visibleLine = SvgHelper.createLine(
      this.x1,
      this.y1,
      this.x2,
      this.y2,
      [
        ['stroke', this.strokeColor],
        ['stroke-width', this.strokeWidth.toString()],
      ]
    );
    this.visual.appendChild(this.selectorLine);
    this.visual.appendChild(this.visibleLine);
  }

  /**
   * Adds an element to the connector's container.
   * The elements are inserted in the beggining (lowest layer) of the stack.
   * @param element - element to add.
   */
  public addVisualToContainer(element: SVGElement): void {
    if (this.container.childNodes.length > 0) {
      this.container.insertBefore(element, this.container.childNodes[0]);
    } else {
      this.container.appendChild(element);
    }
  }

  private getArrowPoints(offsetX: number, offsetY: number): string {
    const width = this.arrowBaseWidth + this.strokeWidth * 2;
    const height = this.arrowBaseHeight + this.strokeWidth * 2;
    return `${offsetX - width / 2},${
      offsetY + height - this.strokeWidth
    } ${offsetX},${offsetY - this.strokeWidth} ${offsetX + width / 2},${
      offsetY + height - this.strokeWidth
    }`;
  }

  private createTips() {
    this.arrow1 = SvgHelper.createPolygon(
      this.getArrowPoints(this.x1, this.y1),
      [['fill', this.strokeColor]]
    );
    this.arrow1.transform.baseVal.appendItem(SvgHelper.createTransform());
    this.visual.appendChild(this.arrow1);

    this.arrow2 = SvgHelper.createPolygon(
      this.getArrowPoints(this.x2, this.y2),
      [['fill', this.strokeColor]]
    );
    this.arrow2.transform.baseVal.appendItem(SvgHelper.createTransform());
    this.visual.appendChild(this.arrow2);
  }

  /**
   * Adjusts layout of the connector.
   */
  public adjust(): void {
    this.adjustPoints();
    this.adjustVisual();
  }

  /**
   * Adjusts connector's end pointis.
   */
  public adjustPoints(): void {
    if (this.startStencil && this.startPort) {
      const start = this.startStencil.getPortPosition(this.startPort.location);
      this.x1 = start.x;
      this.y1 = start.y;
    }
    if (this.endStencil && this.endPort) {
      const end = this.endStencil.getPortPosition(this.endPort.location);

      this.x2 = end.x;
      this.y2 = end.y;
    }
  }

  /**
   * Gets coordinates of connector's line ending depending on the
   * arrow types and other factors. 
   * @param baseEnding - base connector ending (as if there were no arrows, etc.)
   * @param port - port to which the connector is connected.
   * @returns - adjusted coordinates of connector line ending.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getEnding(baseEnding: IPoint, port?: Port): IPoint {
    const result: IPoint = { x: baseEnding.x, y: baseEnding.y };
    return result;
  }

  /**
   * Gets coordinates of connector line endings adjusted based on arrow types
   * and other factors
   * @returns connector ending coordinates.
   */
  protected getEndings(): [IPoint, IPoint] {
    let ending1: IPoint = { x: this.x1, y: this.y1 };
    let ending2: IPoint = { x: this.x2, y: this.y2 };

    if (this.arrowType === 'both' || this.arrowType === 'start') {
      ending1 = this.getEnding(ending1, this.startPort);
    }
    if (this.arrowType === 'both' || this.arrowType === 'end') {
      ending2 = this.getEnding(ending2, this.endPort);
    }

    return [ending1, ending2];
  }

  /**
   * Adjusts connector visual based on updated position and other
   * circumnstances.
   */
  public adjustVisual(): void {
    if (this.selectorLine && this.visibleLine) {
      const [ending1, ending2] = this.getEndings();

      this.selectorLine.setAttribute('x1', ending1.x.toString());
      this.selectorLine.setAttribute('y1', ending1.y.toString());
      this.selectorLine.setAttribute('x2', ending2.x.toString());
      this.selectorLine.setAttribute('y2', ending2.y.toString());

      this.visibleLine.setAttribute('x1', ending1.x.toString());
      this.visibleLine.setAttribute('y1', ending1.y.toString());
      this.visibleLine.setAttribute('x2', ending2.x.toString());
      this.visibleLine.setAttribute('y2', ending2.y.toString());

      SvgHelper.setAttributes(this.visibleLine, [['stroke', this.strokeColor]]);
      SvgHelper.setAttributes(this.visibleLine, [
        ['stroke-width', this.strokeWidth.toString()],
      ]);
      SvgHelper.setAttributes(this.visibleLine, [
        ['stroke-dasharray', this.strokeDasharray.toString()],
      ]);

      this.adjustTips();

      this.setTextBoundingBox();
      this.moveLabel();
    }
  }

  /**
   * Adjust connector tips (arrows).
   */
  public adjustTips() {
    if (this.arrow1 && this.arrow2) {
      this.arrow1.style.display =
        (this.arrowType === 'both' || this.arrowType === 'start') &&
        this.startPort !== undefined
          ? ''
          : 'none';
      this.arrow2.style.display =
        (this.arrowType === 'both' || this.arrowType === 'end') &&
        this.endPort !== undefined
          ? ''
          : 'none';

      SvgHelper.setAttributes(this.arrow1, [
        ['points', this.getArrowPoints(this.x1, this.y1)],
        ['fill', this.strokeColor],
      ]);
      SvgHelper.setAttributes(this.arrow2, [
        ['points', this.getArrowPoints(this.x2, this.y2)],
        ['fill', this.strokeColor],
      ]);

      this.rotateArrows();
    }
  }

  /**
   * Rotates arrows based on the connector tip position, connected ports, etc.
   */
  protected rotateArrows() {
    if (Math.abs(this.x1 - this.x2) > 0.1) {
      const lineAngle1 =
        (Math.atan((this.y2 - this.y1) / (this.x2 - this.x1)) * 180) / Math.PI +
        90 * Math.sign(this.x1 - this.x2);

      const a1transform = this.arrow1.transform.baseVal.getItem(0);
      a1transform.setRotate(lineAngle1, this.x1, this.y1);
      this.arrow1.transform.baseVal.replaceItem(a1transform, 0);

      const a2transform = this.arrow2.transform.baseVal.getItem(0);
      a2transform.setRotate(lineAngle1 + 180, this.x2, this.y2);
      this.arrow2.transform.baseVal.replaceItem(a2transform, 0);
    }
  }

  /**
   * Sets start tip position to supplied coordinates.
   * @param point new tip position.
   */
  public setStartPosition(point: IPoint) {
    this.x1 = point.x;
    this.y1 = point.y;
    this.adjustVisual();
  }

  /**
   * Sets end tip position to supplied coordinates.
   * @param point new tip position.
   */
  public setEndPosition(point: IPoint) {
    this.x2 = point.x;
    this.y2 = point.y;
    this.adjustVisual();
  }

  /**
   * Moves label to supplied offset coordinates.
   * @param offsetX horizontal offset from the auto-calculated position
   * @param offsetY vertical offset from the auto-calculated position.
   */
  public moveLabel(offsetX = 0, offsetY = 0) {
    this.textBlock.offsetX += offsetX;
    this.textBlock.offsetY += offsetY;
    this.setTextBoundingBox();
  }

  /**
   * Calculates and sets the bounding box for the connector's label.
   */
  protected setTextBoundingBox() {
    this.textBoundingBox.x = Math.min(this.x1, this.x2);
    this.textBoundingBox.y = Math.min(this.y1, this.y2);
    this.textBoundingBox.width =
      Math.max(this.x1, this.x2) - this.textBoundingBox.x;
    this.textBoundingBox.height =
      Math.max(this.y1, this.y2) - this.textBoundingBox.y;
    this.textBlock.boundingBox = this.textBoundingBox;
  }

  /**
   * Sets the color of the connector's visual
   * @param color CSS compatible color.
   */
  public setStrokeColor(color: string): void {
    this.strokeColor = color;
    this.adjustVisual();
  }

  /**
   * Sets connector's arrow type.
   * @param arrowType arrow type.
   */
  public setArrowType(arrowType: ArrowType): void {
    this.arrowType = arrowType;
    this.adjustVisual();
  }

  /**
   * Scales the connector based on supplied scale factors.
   * @param scaleX horizontal scale factor.
   * @param scaleY vertical scale factor.
   */
  public scale(scaleX: number, scaleY: number): void {
    this.x1 = this.x1 * scaleX;
    this.y1 = this.y1 * scaleY;
    this.x2 = this.x2 * scaleX;
    this.y2 = this.y2 * scaleY;

    this.adjustVisual();
  }

  /**
   * Returns connector's state (configuration) used for storing the diagram 
   * and for undo/redo operations.
   * @returns connector state object.
   */
  public getState(): ConnectorBaseState {
    return {
      typeName: this.typeName,
      iid: this.IId,

      startStencilId: this.startStencil?.IId,
      startPortLocation: this.startPort?.location,

      endStencilId: this.endStencil?.IId,
      endPortLocation: this.endPort?.location,

      labelOffsetX: this.textBlock.offsetX,
      labelOffsetY: this.textBlock.offsetY,

      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray,

      arrowType: this.arrowType,

      labelText: this.labelText,
    };
  }

  /**
   * Restores connector settings from a previously saved state (configuration).
   * @param state previously saved or created state.
   * @param endPoints stencils and ports the connector is connecting.
   */
  public restoreState(
    state: ConnectorBaseState,
    endPoints: ConnectorEndPoints
  ) {
    this._iid = state.iid;

    if (state.strokeColor !== undefined) {
      this.strokeColor = state.strokeColor;
    }
    if (state.strokeWidth !== undefined) {
      this.strokeWidth = state.strokeWidth;
    }
    if (state.strokeDasharray !== undefined) {
      this.strokeDasharray = state.strokeDasharray;
    }

    if (state.labelOffsetX !== undefined) {
      this.textBlock.offsetX = state.labelOffsetX;
    }
    if (state.labelOffsetY !== undefined) {
      this.textBlock.offsetY = state.labelOffsetY;
    }

    this.startStencil = endPoints.startStencil;
    this.startPort = endPoints.startPort;
    this.endStencil = endPoints.endStencil;
    this.endPort = endPoints.endPort;

    if (state.arrowType !== undefined) {
      this.arrowType = state.arrowType;
    }

    this.labelText = state.labelText ?? '';

    this.createVisual();
    this.adjustPoints();
    this.adjustVisual();
  }
}
