import { SvgHelper } from './SvgHelper';
import { Port } from './Port';


export class PortConnector {
  public port: Port;

  public visual: SVGGraphicsElement;
  public readonly PORT_SIZE = 5;

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
  }

  public ownsTarget(el: EventTarget): boolean {
    if (el === this.visual ||
      el === this.visual.childNodes[0] ||
      el === this.visual.childNodes[1]) {
      return true;
    } else {
      return false;
    }
  }
}
