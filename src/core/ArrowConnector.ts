import { ConnectorBase } from './ConnectorBase';
import { DiagramSettings } from './DiagramSettings';

/**
 * Arrow connector is a type of simple straight connector with an arrow pre-enabled on the end tip.
 */
export class ArrowConnector extends ConnectorBase {
  public static typeName = 'ArrowConnector';

  /**
   * {@inheritDoc core!ConnectorBase.constructor}
   */  
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.arrowType = 'end';
  }
}
