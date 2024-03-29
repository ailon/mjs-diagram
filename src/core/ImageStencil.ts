import { SvgHelper } from './SvgHelper';
import { DiagramSettings } from './DiagramSettings';
import { TextStencil } from './TextStencil';
import {
  ImageStencilState,
  ImageType,
  TextLabelLocation,
} from './ImageStencilState';

/**
 * Base stencil type for stencils defined by a drawing or a raster image.
 */
export class ImageStencil extends TextStencil {
  public static typeName = 'ImageStencil';

  public static title = 'Image stencil';

  protected static DEFAULT_TEXT = 'Image';

  /**
   * Inner SVG string content of an SVG image (w/o the SVG tags).
   */
  protected static svgString?: string;

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    if (this.svgString === undefined) {
      return super.getThumbnail(width, height);
    } else {
      const rectWidth = width * 0.9;
      const rectHeight = Math.min(height * 0.9, rectWidth * 0.4);

      const thumbnail = SvgHelper.createSvgFromString(this.svgString);
      SvgHelper.setAttributes(thumbnail, [
        ['viewBox', '0 0 24 24'],
        ['width', `${rectWidth}px`],
        ['height', `${rectHeight}px`],
      ]);
      return thumbnail;
    }
  }

  /**
   * Main SVG or image element of the stencil.
   */
  protected SVGImage?: SVGSVGElement | SVGImageElement;
  protected imageType: ImageType = 'svg';
  protected _imageSrc?: string; // = 'data:image/png;base64,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';
  public get imageSrc() {
    return this._imageSrc;
  }
  public set imageSrc(value) {
    this._imageSrc = value;
    if (this.SVGImage && this.imageType === 'bitmap') {
      if (value !== undefined) {
        this._isImageSet = true;
        SvgHelper.setAttributes(this.SVGImage, [['href', value]]);
      } else {
        this._isImageSet = false;
        SvgHelper.setAttributes(this.SVGImage, [['href', '']]);
      }
      this.setTextBoundingBox();
    }
  }

  private _isImageSet = false;

  /**
   * Natural (real) width of the image.
   */
  protected naturalWidth = 24;
  /**
   * Natural (real) height of the image.
   */
  protected naturalHeight = 24;

  public labelLocation: TextLabelLocation = 'bottom';

  // protected SVGImage?: SVGSVGElement | SVGImageElement = SvgHelper.createImage([
  //   [
  //     'href',
  //     'data:image/png;base64,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',
  //   ],
  // ]);

  /**
   * {@inheritDoc core!StencilBase.constructor}
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.createImage = this.createImage.bind(this);
    this.adjustImage = this.adjustImage.bind(this);
    this.setTextBoundingBox = this.setTextBoundingBox.bind(this);
    this.textSizeChanged = this.textSizeChanged.bind(this);
    this.setLabelLocation = this.setLabelLocation.bind(this);
    this.toggleLabelVisibility = this.toggleLabelVisibility.bind(this);
  }

  private _textBlockChangeProcessed = false;
  private textSizeChanged() {
    if (!this._textBlockChangeProcessed) {
      this._textBlockChangeProcessed = true;
      this.setTextBoundingBox();
    } else {
      this._textBlockChangeProcessed = false;
    }
  }

  protected setTextBoundingBox(): void {
    if (this._isImageSet) {
      switch (this.labelLocation) {
        case 'top':
        case 'bottom': {
          this.textBoundingBox.x = this.padding;
          this.textBoundingBox.width = this.width - this.padding * 2;
          if (
            this.textBlock &&
            this.textBlock.textSize !== undefined &&
            this.textBlock.textSize.height > 0
          ) {
            this.textBoundingBox.y =
              this.labelLocation === 'top'
                ? this.padding
                : this.height - this.padding - this.textBlock.textSize.height;
            this.textBoundingBox.height = this.textBlock.textSize.height;
          } else {
            this.textBoundingBox.y =
              this.labelLocation === 'top'
                ? this.padding
                : this.height - this.padding - 30;
            this.textBoundingBox.height =
              this.height - this.padding - this.textBoundingBox.y;
          }
          break;
        }
        case 'left':
        case 'right': {
          this.textBoundingBox.y = this.padding;
          this.textBoundingBox.width = (this.width - this.padding * 2) * 0.65;
          this.textBoundingBox.x =
            this.labelLocation === 'left'
              ? this.padding
              : this.width - this.padding - this.textBoundingBox.width;
          this.textBoundingBox.height = this.height - this.padding * 2;
          break;
        }
        case 'hidden': {
          this.textBoundingBox.x = 0;
          this.textBoundingBox.y = 0;
          this.textBoundingBox.width = 0;
          this.textBoundingBox.height = 0;
          break;
        }
      }
      this.textBlock.boundingBox = this.textBoundingBox;
      this.adjustImage();
    } else {
      super.setTextBoundingBox();
    }
  }

  public getSelectorPathD(width: number, height: number): string {
    const result = `M 0 0 
      H ${width} 
      V ${height} 
      H 0 
      V 0`;

    return result;
  }

  public ownsTarget(el: EventTarget): boolean {
    return super.ownsTarget(el) || el === this.SVGImage;
  }

  protected createImage(): void {
    if (Object.getPrototypeOf(this).constructor.svgString !== undefined) {
      this._isImageSet = true;
      this.imageType = 'svg';
      this.SVGImage = SvgHelper.createSvgFromString(
        Object.getPrototypeOf(this).constructor.svgString
      );
    } else {
      this.imageType = 'bitmap';
      this._isImageSet = this._imageSrc !== undefined;
      this.SVGImage = SvgHelper.createImage([['href', this._imageSrc ?? '']]);
    }
  }

  public createVisual(): void {
    super.createVisual();
    this.createImage();
    if (this.SVGImage !== undefined) {
      if (this.imageType === 'svg') {
        SvgHelper.setAttributes(this.SVGImage, [
          ['viewBox', `0 0 ${this.naturalWidth} ${this.naturalHeight}`],
          ['pointer-events', 'none'],
          ['fill', this._fillColor],
          ['stroke', this._strokeColor],
          ['stroke-width', this.strokeWidth.toString()],
          ['stroke-dasharray', this.strokeDasharray],
        ]);
        // } else if (this.imageType === 'bitmap') {
      }
      this.adjustImage();
      this.visual.appendChild(this.SVGImage);
    }
    this.textBlock.onTextSizeChanged = this.textSizeChanged;
  }

  public adjustImage(): void {
    if (this.SVGImage !== undefined) {
      this.toggleLabelVisibility();
      switch (this.labelLocation) {
        case 'bottom': {
          this.SVGImage.setAttribute('x', `${this.padding}px`);
          this.SVGImage.setAttribute('y', `${this.padding}px`);
          this.SVGImage.setAttribute('width', `${this.width - this.padding * 2}px`);
          if (this.textBlock && this.textBlock.text !== '') {
            this.SVGImage.setAttribute('height', `${this.textBoundingBox.y - this.padding}px`);
          } else {
            this.SVGImage.setAttribute('height', `${this.height - this.padding}px`);
          }
          break;
        }
        case 'top': {
          this.SVGImage.setAttribute('x', `${this.padding}px`);
          this.SVGImage.setAttribute('y', `${this.textBoundingBox.bottom + this.padding}px`);
          this.SVGImage.setAttribute('width', `${this.width - this.padding * 2}px`);
          this.SVGImage.setAttribute(
            'height',
            `${this.height - this.padding * 2 - this.textBoundingBox.height - this.padding}px`
          );
          break;
        }
        case 'left':
        case 'right': {
          if (this.labelLocation === 'right') {
            this.SVGImage.setAttribute('x', `${this.padding}px`);
          } else {
            this.SVGImage.setAttribute(
              'x',
              `${this.padding + (this.width - this.padding * 2) * 0.65}px`
            );
          }
          this.SVGImage.setAttribute('y', `${this.padding}px`);
          this.SVGImage.setAttribute(
            'height',
            `${this.height - this.padding * 2}px`
          );
          this.SVGImage.setAttribute(
            'width',
            `${(this.width - this.padding * 2) * 0.35}px`
          );
          break;
        }
        case 'hidden': {
          this.SVGImage.setAttribute('x', `${this.padding}px`);
          this.SVGImage.setAttribute('y', `${this.padding}px`);
          this.SVGImage.setAttribute(
            'width',
            `${this.width - this.padding * 2}px`
          );
          this.SVGImage.setAttribute(
            'height',
            `${this.height - this.padding * 2}px`
          );
        }
      }
    }
  }

  public setStrokeColor(color: string): void {
    super.setStrokeColor(color);
    if (this.SVGImage !== undefined) {
      SvgHelper.setAttributes(this.SVGImage, [['stroke', color]]);
    }
  }
  public setFillColor(color: string): void {
    super.setFillColor(color);
    if (this.SVGImage !== undefined) {
      SvgHelper.setAttributes(this.SVGImage, [['fill', color]]);
    }
  }
  public setStrokeWidth(width: number | string): void {
    super.setStrokeWidth(width);
    if (this.SVGImage !== undefined) {
      SvgHelper.setAttributes(this.SVGImage, [
        ['stroke-width', this.strokeWidth.toString()],
      ]);
    }
  }
  public setStrokeDasharray(dashes: string): void {
    super.setStrokeDasharray(dashes);
    if (this.SVGImage !== undefined) {
      SvgHelper.setAttributes(this.SVGImage, [
        ['stroke-dasharray', this.strokeDasharray],
      ]);
    }
  }

  public setLabelLocation(location: TextLabelLocation) {
    this.labelLocation = location;
    this.toggleLabelVisibility();
    this.setTextBoundingBox();
  }

  private toggleLabelVisibility() {
    if (this.textBlock) {
      if (this.labelLocation === 'hidden') {
        this.textBlock.textElement.style.visibility = 'hidden';
      } else {
        this.textBlock.textElement.style.visibility = '';
      }
    }
  }

  public getState(): ImageStencilState {
    const result: ImageStencilState = Object.assign(
      {
        imageType: this.imageType,
        imageSrc: this.imageSrc,
        labelLocation: this.labelLocation,
      },
      super.getState()
    );

    return result;
  }

  public restoreState(state: ImageStencilState): void {
    const imgState = state as ImageStencilState;
    if (imgState.imageType !== undefined) {
      this.imageType = imgState.imageType;
    }
    if (imgState.imageSrc !== undefined) {
      this.imageSrc = imgState.imageSrc;
    }
    if (imgState.labelLocation !== undefined) {
      this.labelLocation = imgState.labelLocation;
    }
    super.restoreState(state);
  }
}
