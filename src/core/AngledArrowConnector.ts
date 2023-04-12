import { AngledConnector } from './AngledConnector';
import { DiagramSettings } from './DiagramSettings';

export class AngledArrowConnector extends AngledConnector {
  public static typeName = 'AngledArrowConnector';

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.arrowType = 'end';
  }
}
