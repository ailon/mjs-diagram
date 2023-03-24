import { CurvedConnector } from './CurvedConnector';
import { DiagramSettings } from './DiagramSettings';

export class CurvedArrowConnector extends CurvedConnector {
  public static typeName = 'CurvedArrowConnector';

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.arrowType = 'end';
  }
}
