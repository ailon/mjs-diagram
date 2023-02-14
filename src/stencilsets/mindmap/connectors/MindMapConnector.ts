import { CurvedConnector } from "../../../core/CurvedConnector";

export class MindMapConnector extends CurvedConnector {
  public static typeName = 'MindMapConnector';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);
    this.andgledCorners = false;
  }
}