import { CurvedConnector, DiagramSettings } from "../../../core";

export class MindMapConnector extends CurvedConnector {
  public static typeName = 'MindMapConnector';

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);
    this.andgledCorners = false;
  }
}