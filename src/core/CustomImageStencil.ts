import { DiagramSettings } from "./DiagramSettings";
import { ImageStencil } from "./ImageStencil";

export class CustomImageStencil extends ImageStencil {
  public static typeName = 'CustomImageStencil';

  public static title = 'Custom image';

  protected static DEFAULT_TEXT = 'Image';

  /**
   * {@inheritDoc core!ConnectorBase.constructor}
   */    
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.defaultSize = { width: 50, height: 80 };

    this.setImageSrc = this.setImageSrc.bind(this);
  }

  public setImageSrc(imageSrc: string) {
    this.imageSrc = imageSrc;
  }
}
