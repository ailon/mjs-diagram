import { DiagramSettings } from "../../../core";
import { RectangleTextStencil } from "../../../core";

/**
 * Terminal Flowchart stencil.
 */
export class TerminalStencil extends RectangleTextStencil {
  public static typeName = 'TerminalStencil';

  public static title = 'Terminal';

  protected static getPathD(width: number, height: number): string {
    const result = `
      M ${height / 2} 0 
      H ${width - height / 2} 
      A ${height / 2} ${height / 2} 0 1 1 ${width - height / 2} ${height}
      H ${height / 2}
      A ${height / 2} ${height / 2} 0 0 1 ${height / 2} ${0}
    `
    return result;
  }

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.getPathD = this.getPathD.bind(this);

    this.textBoundingBox = new DOMRect();

    this.defaultSize = { width: 150, height: 50 };

    this.disablePorts('bottomleft', 'topleft', 'bottomright', 'topright');
  }
}
