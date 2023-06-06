import { FontSize } from "./FontSize";
import { StencilBaseState } from './StencilBaseState';

/**
 * Represents configuration (state) of stencils extending the {@link core!TextStencil}.
 */
export interface TextStencilState extends StencilBaseState {
  /**
   * Text color.
   */
  color?: string;
  /**
   * Font family string.
   */
  fontFamily?: string;
  /**
   * Font size.
   */
  fontSize?: FontSize;
  /**
   * Text pading.
   */
  padding?: number;
  /**
   * Text content.
   */
  text?: string;
}
