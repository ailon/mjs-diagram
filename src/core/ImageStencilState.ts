import { TextStencilState } from "./TextStencilState";

export type ImageType = 'svg' | 'bitmap';

export type TextLabelLocation = 'top' | 'right' | 'bottom' | 'left' | 'hidden';

export interface ImageStencilState extends TextStencilState {
  imageType?: ImageType;
  imageSrc?: string;
  labelLocation?: TextLabelLocation;
}
