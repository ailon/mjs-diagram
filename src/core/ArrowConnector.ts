import { ConnectorBase } from './ConnectorBase';

export class ArrowConnector extends ConnectorBase {
  public static typeName = 'ArrowConnector';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);

    this.arrowType = 'end';
  }
}
