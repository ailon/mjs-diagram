import { TextStencil } from '../../../viewer_index';

export class ProcessStencil extends TextStencil {
  public static typeName = 'ProcessStencil';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);
    this.disablePorts(
      'topleft',
      'topright',
      'bottomleft',
      'bottomright'
    );
  }
}