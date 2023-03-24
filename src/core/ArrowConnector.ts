import { ConnectorBase } from './ConnectorBase';
import { DiagramSettings } from './DiagramSettings';

export class ArrowConnector extends ConnectorBase {
  public static typeName = 'ArrowConnector';

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.arrowType = 'end';
  }
}
