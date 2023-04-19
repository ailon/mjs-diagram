import { SvgHelper, Port } from '../core';


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

    this.ownsTarget = this.ownsTarget.bind(this);
    this.adjustVisual = this.adjustVisual.bind(this);
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

  public adjustVisual(): void {
    const translate = this.visual.transform.baseVal.getItem(0);
    translate.setTranslate(this.port.x - this.PORT_SIZE / 2, this.port.y - this.PORT_SIZE / 2);
    this.visual.transform.baseVal.replaceItem(translate, 0);
  }

}
