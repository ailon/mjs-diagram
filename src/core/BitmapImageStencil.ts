import { CustomImageStencil } from "./CustomImageStencil"
import { DiagramSettings } from "./DiagramSettings";

export class BitmapImageStencil extends CustomImageStencil {
  public static typeName = 'BitmapImageStencil';

  public static title = 'Bitmap image';

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.defaultSize = { width: 100, height: 100 };

    this._fillColor = 'transparent';
    this._strokeColor = 'transparent';
  }
}
