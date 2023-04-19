import { DiagramSettings } from "../core";
import { ColorType } from "../core";

import { ColorSet } from "./ColorSet";
import { FontFamily } from "./FontFamily";

export class EditorSettings extends DiagramSettings {
  private _contextStringArrays: Map<string, Map<string, string[]>> = new Map();

  public getContextStringArray(
    context: string,
    name: string
  ): string[] | undefined {
    const contextBucket = this._contextStringArrays.get(context);
    if (contextBucket !== undefined) {
      return contextBucket.get(name);
    } else {
      return undefined;
    }
  }
  public setContextStringArray(context: string, name: string, value: string[]) {
    let contextBucket = this._contextStringArrays.get(context);
    if (contextBucket === undefined) {
      contextBucket = new Map<string, string[]>();
      this._contextStringArrays.set(context, contextBucket);
    }
    contextBucket.set(name, value);
  }


  public setContextColor(context: string, type: ColorType, color: string) {
    let contextColors = this._colors.get(context);
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
    'blue',
    'black',
    'white',
  );
  public defaultStrokeColorSet = new ColorSet(
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'black',
    'white',
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

  public setContextColorSet(
    context: string,
    type: ColorType,
    colorSet: ColorSet
  ) {
    let contextColorSet = this._colorSets.get(context);
    if (contextColorSet === undefined) {
      contextColorSet = new Map();
      this._colorSets.set(context, contextColorSet);
    }
    contextColorSet.set(type, colorSet);
  }

  public defaultStrokeDasharrays = ['', '3', '12 3', '9 6 3 6'];

  public getDashArrays(context: string): string[] {
    return (
      this.getContextStringArray(context, 'strokeDashArrays') ??
      this.defaultStrokeDasharrays
    );
  }
  public setContextDashArrays(context: string, value: string[]) {
    this.setContextStringArray(context, 'strokeDashArrays', value);
  }

  public defaultStrokeWidths = ['1', '2', '3', '5'];

  public getStrokeWidths(context: string): string[] {
    return (
      this.getContextStringArray(context, 'strokeWidths') ??
      this.defaultStrokeWidths
    );
  }
  public setContextStrokeWidths(context: string, value: string[]) {
    this.setContextStringArray(context, 'strokeWidths', value);
  }

  public defaultFontFamilies: FontFamily[] = [
    new FontFamily('Times, "Times New Roman", serif', 'Serif'),
    new FontFamily('Helvetica, Arial, sans-serif', 'Sans-serif'),
    new FontFamily('Courier, "Courier New", monospace', 'Monospace'),
  ];

  private _fontFamilies: Map<string, Array<FontFamily>> = new Map();
  public getFontFamilies(context: string): FontFamily[] {
    const fontFamilies = this._fontFamilies.get(context);
    return (
      fontFamilies ??
      this.defaultFontFamilies
    );
  }
  public setContextFontFamilies(context: string, value: FontFamily[]) {
    this._fontFamilies.set(context, value);
  }
}
