import { DiagramSettings } from "./DiagramSettings";
import { TextStencil } from "./TextStencil";

/**
 * Label stencil is a simple text stencil with no outline or background.
 */
export class LabelStencil extends TextStencil {
  public static typeName = 'LabelStencil';

  public static title = 'Label';

  protected static DEFAULT_TEXT = 'Label';

  /**
   * {@inheritDoc core!ConnectorBase.constructor}
   */  
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);
    
    this.strokeEditable = false;
    this.fillEditable = false;
  }
}