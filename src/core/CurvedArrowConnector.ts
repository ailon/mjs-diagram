import { CurvedConnector } from './CurvedConnector';
import { DiagramSettings } from './DiagramSettings';

/**
 * Represents a curved connector with an arrow pre-enabled on the end tip.
 */
export class CurvedArrowConnector extends CurvedConnector {
  public static typeName = 'CurvedArrowConnector';

  /**
   * {@inheritDoc core!ConnectorBase.constructor}
   */  
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.arrowType = 'end';
  }
}
