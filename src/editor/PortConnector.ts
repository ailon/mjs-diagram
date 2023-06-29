import { SvgHelper, Port } from '../core';

/**
 * Visual representation of a port for connectors.
 * 
 * @see {@link core!Port}
 */
export class PortConnector {
  /**
   * Port the visual represents.
   */
  public port: Port;

  /**
   * Port connector visual element.
   */
  public visual: SVGGraphicsElement;
  /**
   * Visual size.
   */
  public readonly PORT_SIZE = 5;

  /**
   * Creates a new visual for the port.
   * @param port underlying port.
   */
  constructor(port: Port) {
    this.port = port;

    this.visual = SvgHelper.createGroup();
    this.visual.appendChild(
      SvgHelper.createCircle(this.PORT_SIZE * 1.5, [['fill', 'transparent']])
    );
    this.visual.appendChild(
      SvgHelper.createCircle(this.PORT_SIZE, [
        ['fill', '#88ccff'],
        ['stroke', '#338833'],
        ['stroke-width', '2'],
        ['stroke-opacity', '0.7']
      ])
    );

    this.ownsTarget = this.ownsTarget.bind(this);
    this.adjustVisual = this.adjustVisual.bind(this);
  }

  /**
   * Returns true if supplied element belongs to the port connector.
   * @param el target element.
   * @returns true if the element belongs to this port connector.
   */
  public ownsTarget(el: EventTarget): boolean {
    if (el === this.visual ||
      el === this.visual.childNodes[0] ||
      el === this.visual.childNodes[1]) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Updates the visual.
   */
  public adjustVisual(): void {
    const translate = this.visual.transform.baseVal.getItem(0);
    translate.setTranslate(this.port.x - this.PORT_SIZE / 2, this.port.y - this.PORT_SIZE / 2);
    this.visual.transform.baseVal.replaceItem(translate, 0);
  }

}
