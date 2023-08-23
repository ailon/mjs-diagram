import { CustomImageStencil, ImageStencilState, StencilBaseState } from "../core";
import { StencilEditorProperties } from "./StencilEditorProperties";
import { TextStencilEditor } from "./TextStencilEditor";
import { CustomImagePanel } from "./panels/CustomImagePanel";
import { LabelLocationPanel } from "./panels/LabelLocationPanel";
import { PropertyPanelBase } from "./panels/PropertyPanelBase";

/**
 * Specialized stencil editor for custom image stencils.
 * 
 * @see {@link core!CustomImageStencil}
 */
export class CustomImageStencilEditor extends TextStencilEditor {
  private imagePanel: CustomImagePanel;
  private labelLocationPanel: LabelLocationPanel

  constructor(properties: StencilEditorProperties) {
    super(properties);

    this.imagePanel = new CustomImagePanel(
      this._language.getString('toolbox-image-title') ?? 'Image', 
      this._language,
      (<CustomImageStencil>this._stencil).imageSrc
    );
    this.imagePanel.onImageChanged = (<CustomImageStencil>this._stencil).setImageSrc;

    this.labelLocationPanel = new LabelLocationPanel(
      this._language.getString('toolbox-label-location-title') ?? 'Text location', 
      this._language,
      (<CustomImageStencil>this._stencil).labelLocation
    )
    this.labelLocationPanel.onLabelLocationChanged = (<CustomImageStencil>this._stencil).setLabelLocation;
  }

  public get propertyPanels(): PropertyPanelBase[] {
    return [this.imagePanel, this.labelLocationPanel, ...super.propertyPanels];
  }

  public restoreState(state: StencilBaseState): void {
    this.imagePanel.currentImageSrc = (<ImageStencilState>state).imageSrc;
    super.restoreState(state);
  }

}
