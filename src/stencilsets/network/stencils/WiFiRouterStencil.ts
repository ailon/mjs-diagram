import { DiagramSettings, ImageStencil } from "../../../core";

/**
 * WiFi router image stencil.
 */
export class WiFiRouterStencil extends ImageStencil {
  public static typeName = 'WiFiRouterStencil';

  public static title = 'WiFi Router';

  protected static DEFAULT_TEXT = 'WiFi Router';

  protected static svgString = '<path d="M20.2,5.9L21,5.1C19.6,3.7 17.8,3 16,3C14.2,3 12.4,3.7 11,5.1L11.8,5.9C13,4.8 14.5,4.2 16,4.2C17.5,4.2 19,4.8 20.2,5.9M19.3,6.7C18.4,5.8 17.2,5.3 16,5.3C14.8,5.3 13.6,5.8 12.7,6.7L13.5,7.5C14.2,6.8 15.1,6.5 16,6.5C16.9,6.5 17.8,6.8 18.5,7.5L19.3,6.7M19,13H17V9H15V13H5A2,2 0 0,0 3,15V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V15A2,2 0 0,0 19,13M8,18H6V16H8V18M11.5,18H9.5V16H11.5V18M15,18H13V16H15V18Z" />';

  /**
   * {@inheritDoc core!ImageStencil.constructor}
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.defaultSize = { width: 80, height: 80 };

    this.strokeEditable = false;
    this.setStrokeWidth(0);
  }
}
