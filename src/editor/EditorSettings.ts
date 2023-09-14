import { DiagramSettings } from "../core";
import { ColorType } from "../core";

import { ColorSet } from "./ColorSet";
import { FontFamily } from "./FontFamily";

/**
 * Editor settings is a class for holding the default and custom settings for
 * stencils and connector types.
 */
export class EditorSettings extends DiagramSettings {
  private _contextStringArrays: Map<string, Map<string, string[]>> = new Map();

  /**
   * Returns a string array setting for provided context and setting name.
   * @param context setting group (stencil or connector type, etc.)
   * @param name setting name.
   * @returns string array setting value.
   */
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
  /**
   * Sets the contextual string array setting.
   * @param context setting group (stencil or connector type, etc.)
   * @param name setting name.
   * @param value string array setting value.
   */
  public setContextStringArray(context: string, name: string, value: string[]) {
    let contextBucket = this._contextStringArrays.get(context);
    if (contextBucket === undefined) {
      contextBucket = new Map<string, string[]>();
      this._contextStringArrays.set(context, contextBucket);
    }
    contextBucket.set(name, value);
  }

  /**
   * Default colors for text.
   */
  public defaultTextColorSet = new ColorSet(
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'black',
    'white',
  );
  /**
   * Default stroke (line, outline) color set.
   */
  public defaultStrokeColorSet = new ColorSet(
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'black',
    'white',
  );
  /**
   * Default fill color set.
   */
  public defaultFillColorSet = new ColorSet(
    '#cccccc',
    '#ffcccc',
    '#ccffcc',
    '#ccccff',
    'transparent'
  );
  /**
   * Default background color set.
   */
  public defaultBackgroundColorSet = new ColorSet(
    '#ffffff',
    '#cccccc',
    '#ffcccc',
    '#ccffcc',
    '#ccccff'
  );

  private _colorSets: Map<string, Map<ColorType, ColorSet>> = new Map();
  /**
   * Returns a contextual color set.
   * @param context setting group (stencil or connector type, etc.)
   * @param type type of color (fill, stroke, text, etc.)
   * @returns contextual color set.
   */
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

  /**
   * Sets a contextual color set.
   * @param context setting group (stencil or connector type, etc.)
   * @param type type of color (fill, stroke, text, etc.)
   * @param colorSet color set value.
   */
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

  /**
   * Default stroke dash array collection.
   * 
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   */
  public defaultStrokeDasharrays = ['', '3', '12 3', '9 6 3 6'];

  /**
   * Returns a contextual dash array.
   * 
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   * 
   * @param context setting group (stencil or connector type, etc.)
   * @returns dash array.
   */
  public getDashArrays(context: string): string[] {
    return (
      this.getContextStringArray(context, 'strokeDashArrays') ??
      this.defaultStrokeDasharrays
    );
  }

  /**
   * Sets a contextual dash array setting.
   * 
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   * 
   * @param context setting group (stencil or connector type, etc.)
   * @param value dash array value
   */
  public setContextDashArrays(context: string, value: string[]) {
    this.setContextStringArray(context, 'strokeDashArrays', value);
  }

  /**
   * Array of default stroke width options (in pixels).
   */
  public defaultStrokeWidths = ['1', '2', '3', '5'];

  /**
   * Returns a contextual stroke width collection setting.
   * @param context setting group (stencil or connector type, etc.)
   * @returns stroke width collection (in pixels)
   */
  public getStrokeWidths(context: string): string[] {
    return (
      this.getContextStringArray(context, 'strokeWidths') ??
      this.defaultStrokeWidths
    );
  }
  /**
   * Sets a contextual stroke width collection setting.
   * @param context setting group (stencil or connector type, etc.)
   * @param value stroke width array.
   */
  public setContextStrokeWidths(context: string, value: string[]) {
    this.setContextStringArray(context, 'strokeWidths', value);
  }

  /**
   * Default collection of font families.
   */
  public defaultFontFamilies: FontFamily[] = [
    new FontFamily('Times, "Times New Roman", serif', 'Serif'),
    new FontFamily('Helvetica, Arial, sans-serif', 'Sans-serif'),
    new FontFamily('Courier, "Courier New", monospace', 'Monospace'),
  ];

  private _fontFamilies: Map<string, Array<FontFamily>> = new Map();
  /**
   * Returns a contextual collection of font families.
   * @param context setting group (stencil or connector type, etc.)
   * @returns collection of font families for the context.
   */
  public getFontFamilies(context: string): FontFamily[] {
    const fontFamilies = this._fontFamilies.get(context);
    return (
      fontFamilies ??
      this.defaultFontFamilies
    );
  }
  /**
   * Sets a contextual collection of font families.
   * @param context setting group (stencil or connector type, etc.)
   * @param value array of font families.
   */
  public setContextFontFamilies(context: string, value: FontFamily[]) {
    this._fontFamilies.set(context, value);
  }
}
