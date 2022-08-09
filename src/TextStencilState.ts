import { StencilBaseState } from './StencilBaseState';

export interface TextStencilState extends StencilBaseState {
  color: string;
  fontFamily: string;
  padding: number;
  text: string;
}