import { CustomImageStencil, ImageStencilState, StencilBaseState } from "../core";
import { StencilEditorProperties } from "./StencilEditorProperties";
import { TextStencilEditor } from "./TextStencilEditor";
import { CustomImagePanel } from "./panels/CustomImagePanel";
import { PropertyPanelBase } from "./panels/PropertyPanelBase";

/**
 * Specialized stencil editor for custom image stencils.
 * 
 * @see {@link core!CustomImageStencil}
 */
export class CustomImageStencilEditor extends TextStencilEditor {
  private imagePanel: CustomImagePanel;

  constructor(properties: StencilEditorProperties) {
    super(properties);

    this.imagePanel = new CustomImagePanel(
      this._language.getString('toolbox-image-title') ?? 'Image', 
      this._language,
      (<CustomImageStencil>this._stencil).imageSrc
    );

    this.imagePanel.onImageChanged = (<CustomImageStencil>this._stencil).setImageSrc;
  }

  public get propertyPanels(): PropertyPanelBase[] {
    return [this.imagePanel, ...super.propertyPanels];
  }

  public restoreState(state: StencilBaseState): void {
    this.imagePanel.currentImageSrc = (<ImageStencilState>state).imageSrc;
    super.restoreState(state);
  }

}
