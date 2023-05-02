import { TextStencilEditor } from "./TextStencilEditor";
import { PropertyPanelBase } from "./panels/PropertyPanelBase";

export class ImageStencilEditor extends TextStencilEditor {
  public get propertyPanels(): PropertyPanelBase[] {
    return [this.textPanel];
  }
}