import { Color } from "./Color";

/**
 * Represents a collection of colors.
 * 
 * @see {@link Color}
 */
export class ColorSet extends Array<Color> {
  /**
   * Creates a new ColorSet from a list of colors.
   * @param colors comma-separated list of colors.
   */
  constructor(...colors: (Color | string)[]) {
    super();
    if (colors.length > 0) {
      colors.forEach((color) => {
        if (typeof color === 'string') {
          this.push(new Color(color));
        } else {
          this.push(color);
        }
      });
    }
  }
}
