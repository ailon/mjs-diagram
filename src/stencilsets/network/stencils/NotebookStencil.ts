import { DiagramSettings, ImageStencil } from "../../../core";

export class NotebookStencil extends ImageStencil {
  public static typeName = 'NotebookStencil';

  public static title = 'Notebook';

  protected static DEFAULT_TEXT = 'Notebook';

  protected static svgString = '<path d="M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H0V20H24V18H20Z" />';

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.defaultSize = { width: 80, height: 80 };

    this.strokeEditable = false;
    this.setStrokeWidth(0);
  }
}
