import { Color } from "./Color";


export class ColorSet extends Array<Color> {
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
