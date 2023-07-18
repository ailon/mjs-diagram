import { CurvedConnector, DiagramSettings } from "../../../core";

/**
 * Mind Map connector.
 */
export class MindMapConnector extends CurvedConnector {
  public static typeName = 'MindMapConnector';

  /**
   * {@inheritDoc core!CurvedConnector.constructor}
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);
    this.andgledCorners = false;
  }
}