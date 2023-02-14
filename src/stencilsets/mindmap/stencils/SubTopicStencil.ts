import { TextStencil } from "../../../core/TextStencil";

export class SubTopicStencil extends TextStencil {
  public static typeName = 'SubTopicStencil';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getThumbnail(width: number, height: number): SVGSVGElement {
    return super.getThumbnail(width, width / 4);
  }

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);
    this.disablePorts(
      'topleft',
      'topcenter',
      'topright',
      'bottomcenter',
      'bottomleft',
      'bottomright'
    );
  }
}
