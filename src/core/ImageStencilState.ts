import { TextStencilState } from "./TextStencilState";

export type ImageType = 'svg' | 'bitmap';

export interface ImageStencilState extends TextStencilState {
  imageType?: ImageType;
  imageSrc?: string;
}