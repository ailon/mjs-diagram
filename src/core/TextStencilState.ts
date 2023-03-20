import { FontSize } from '../editor/EditorSettings';
import { StencilBaseState } from './StencilBaseState';

export interface TextStencilState extends StencilBaseState {
  color: string;
  fontFamily: string;
  fontSize: FontSize;
  padding: number;
  text: string;
}