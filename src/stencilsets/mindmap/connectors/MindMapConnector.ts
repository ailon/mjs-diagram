import { CurvedConnector } from "../../../core/CurvedConnector";
import { DiagramSettings } from "../../../core/DiagramSettings";

export class MindMapConnector extends CurvedConnector {
  public static typeName = 'MindMapConnector';

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);
    this.andgledCorners = false;
  }
}