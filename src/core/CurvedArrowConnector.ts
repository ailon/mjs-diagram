import { CurvedConnector } from './CurvedConnector';

export class CurvedArrowConnector extends CurvedConnector {
  public static typeName = 'CurvedArrowConnector';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.arrowType = 'end';
  }
}
