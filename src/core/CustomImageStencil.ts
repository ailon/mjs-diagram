import { DiagramSettings } from "./DiagramSettings";
import { ImageStencil } from "./ImageStencil";
import { SvgHelper } from "./SvgHelper";

export class CustomImageStencil extends ImageStencil {
  public static typeName = 'CustomImageStencil';

  public static title = 'Custom image';

  protected static DEFAULT_TEXT = 'Image';

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    const rectWidth = width * 0.9;
    const rectHeight = Math.min(height * 0.9, rectWidth * 0.4);

    const thumbnail = SvgHelper.createSvgFromString('<path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />');
    SvgHelper.setAttributes(thumbnail, [
      ['viewBox', '0 0 24 24'],
      ['width', `${rectWidth}px`],
      ['height', `${rectHeight}px`],
    ]);
    return thumbnail;
  }

  /**
   * {@inheritDoc core!ConnectorBase.constructor}
   */    
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.defaultSize = { width: 100, height: 100 };

    this.setImageSrc = this.setImageSrc.bind(this);
  }

  public setImageSrc(imageSrc?: string) {
    this.imageSrc = imageSrc;
  }
}
