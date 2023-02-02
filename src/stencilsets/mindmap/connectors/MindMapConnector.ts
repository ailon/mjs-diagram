import { CurvedConnector } from "../../../viewer_index"

export class MindMapConnector extends CurvedConnector {
  public static typeName = 'MindMapConnector';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);
    this.andgledCorners = false;
  }
}