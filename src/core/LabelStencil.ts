import { DiagramSettings } from "./DiagramSettings";
import { TextStencil } from "./TextStencil";

export class LabelStencil extends TextStencil {
  public static typeName = 'LabelStencil';

  public static title = 'Label';

  protected static DEFAULT_TEXT = 'Label';

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);
    
    this.strokeEditable = false;
    this.fillEditable = false;
  }
}