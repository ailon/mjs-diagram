import { AngledConnector } from './AngledConnector';
import { DiagramSettings } from './DiagramSettings';

/**
 * Represents an angled connector with an arrow pointer pre-set.
 */
export class AngledArrowConnector extends AngledConnector {
  public static typeName = 'AngledArrowConnector';

  /**
   * {@inheritDoc core!ConnectorBase.constructor}
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.arrowType = 'end';
  }
}
