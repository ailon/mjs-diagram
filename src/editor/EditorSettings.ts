export class Color {
  public value: string;

  private _label?: string | undefined;
  public get label(): string | undefined {
    return this._label ?? this.value;
  }
  public set label(value: string | undefined) {
    this._label = value;
  }

  constructor(value: string, label?: string) {
    this.value = value;
    if (label !== undefined) {
      this.label = label;
    }
  }
}

export type ColorType = 'text' | 'stroke' | 'fill' | 'background';

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

export class EditorSettings {
  public defaultColor = '#000';
  public defaultTextColor = this.defaultColor;
  public defaultStrokeColor = this.defaultColor;
  public defaultFillColor = '#ccc';
  public defaultBackgroundColor = '#fff';

  private _colors: Map<string, Map<ColorType, string>> = new Map();
  public getColor(context: string, type: ColorType): string {
    const contextColor = this._colors.get(context)?.get(type);
    if (contextColor !== undefined) {
      return contextColor;
    } else {
      switch (type) {
        case 'background': {
          return this.defaultBackgroundColor;
        }
        case 'fill': {
          return this.defaultFillColor;
        }
        case 'stroke': {
          return this.defaultStrokeColor;
        }
        case 'text': {
          return this.defaultTextColor;
        }
        default: {
          return this.defaultColor;
        }
      }
    }
  }

  public setContextColor(context: string, type: ColorType, color: string) {
    let contextColors = this._colors.get(context)
    if (contextColors === undefined) {
      contextColors = new Map();
      this._colors.set(context, contextColors);
    }
    contextColors.set(type, color);
  }

  public defaultTextColorSet = new ColorSet(
    'red',
    'orange',
    'yellow',
    'green',
    'lightblue',
    'blue',
    'magenta',
    'black',
    'white',
    'brown'
  );
  public defaultStrokeColorSet = new ColorSet(
    'red',
    'orange',
    'yellow',
    'green',
    'lightblue',
    'blue',
    'magenta',
    'black',
    'white',
    'brown'
  );
  public defaultFillColorSet = new ColorSet(
    '#cccccc',
    '#ffcccc',
    '#ccffcc',
    '#ccccff',
    'transparent'
  );
  public defaultBackgroundColorSet = new ColorSet(
    '#ffffff',
    '#cccccc',
    '#ffcccc',
    '#ccffcc',
    '#ccccff'
  );

  private _colorSets: Map<string, Map<ColorType, ColorSet>> = new Map();
  public getColorSet(context: string, type: ColorType): ColorSet {
    const contextColorSet = this._colorSets.get(context)?.get(type);
    if (contextColorSet !== undefined) {
      return contextColorSet;
    } else {
      switch (type) {
        case 'background': {
          return this.defaultBackgroundColorSet;
        }
        case 'fill': {
          return this.defaultFillColorSet;
        }
        case 'stroke': {
          return this.defaultStrokeColorSet;
        }
        case 'text': {
          return this.defaultTextColorSet;
        }
        default: {
          return this.defaultStrokeColorSet;
        }
      }
    }
  }

  public setContextColorSet(context: string, type: ColorType, colorSet: ColorSet) {
    let contextColorSet = this._colorSets.get(context)
    if (contextColorSet === undefined) {
      contextColorSet = new Map();
      this._colorSets.set(context, contextColorSet);
    }
    contextColorSet.set(type, colorSet);
  }

}
