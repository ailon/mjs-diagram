import { FontSize } from "./FontSize";
import { ColorType } from "./ColorType";

/**
 * Diagram settings represent a collection of core and custom settings
 * for a diagram.
 */
export class DiagramSettings {
  /**
   * Stores arbitrary string settings grouped by context (eg. some module, stencil type, etc.).
   */
  protected _contextStrings: Map<string, Map<string, string>> = new Map();
  /**
   * Returns an arbitrary string setting for provided context and setting name.
   * @param context type or module name (or other context collection)
   * @param name setting name
   * @returns string setting for context-name pair or undefined, if not found.
   * 
   * @example
   * ```ts
   * dashhArray = settings.getContextString('DiamondStencil', 'strokeDashArray');
   * ```
   */
  public getContextString(context: string, name: string): string | undefined {
    const contextBucket = this._contextStrings.get(context);
    if (contextBucket !== undefined) {
      return contextBucket.get(name);
    } else {
      return undefined;
    }
  }
  /**
   * Sets an arbitrary string setting for some context (type or module name) and setting name.
   * @param context type or module name (or some other context)
   * @param name setting name
   * @param value setting value
   */
  public setContextString(context: string, name: string, value: string) {
    let contextBucket = this._contextStrings.get(context);
    if (contextBucket === undefined) {
      contextBucket = new Map<string, string>();
      this._contextStrings.set(context, contextBucket);
    }
    contextBucket.set(name, value);
  }

  /**
   * Default color.
   */
  public defaultColor = '#000';
  /**
   * Default text (font) color.
   */
  public defaultTextColor = this.defaultColor;
  /**
   * Default stroke (line) color.
   */
  public defaultStrokeColor = this.defaultColor;
  /**
   * Default fill color.
   */
  public defaultFillColor = '#ccc';
  /**
   * Default background color.
   */
  public defaultBackgroundColor = '#fff';

  /**
   * Stores a collection of color settings grouped by context (type or module name). 
   */
  protected _colors: Map<string, Map<ColorType, string>> = new Map();
  /**
   * Returns a color setting by provided context and type of color.
   * @param context type or module name
   * @param type color kind (text, fill, stroke, etc.)
   * @returns CSS color string for the context-type pair or the default color for the type.
   */
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

  /**
   * Default stroke dash array.
   * 
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   */
  public defaultStrokeDasharray = '';

  /**
   * Gets the stroke dash array setting for the provided type (context) or the default stroke dash array, if not found.
   * @param context type or module name (or other context)
   * @returns stroke dash array for the context or the {@link defaultStrokeDasharray}.
   */
  public getDashArray(context: string): string {
    return (
      this.getContextString(context, 'strokeDashArray') ??
      this.defaultStrokeDasharray
    );
  }
  /**
   * Sets custom dash array for the provided context (type or module name).
   * @param context type or module name
   * @param value dash array value
   */
  public setContextDashArray(context: string, value: string) {
    this.setContextString(context, 'strokeDashArray', value);
  }

  /**
   * Default stroke width.
   */
  public defaultStrokeWidth = '1';
  /**
   * Returns stroke width for the specified context (type or module name) or the default stroke width.
   * @param context type or module name
   * @returns stroke width for the context or {@link defaultStrokeWidth}
   */
  public getStrokeWidth(context: string): string {
    return (
      this.getContextString(context, 'strokeWidth') ?? this.defaultStrokeWidth
    );
  }
  /**
   * Sets custom stroke width for the provided context (type or module name).
   * @param context type or module name
   * @param value stroke width value
   */
  public setContextStrokeWidth(context: string, value: string) {
    this.setContextString(context, 'strokeWidth', value);
  }

  /**
   * Default font family.
   */
  public defaultFontFamily = 'Helvetica, Arial, sans-serif';

  /**
   * A collection of font family settings for different contexts (type or module names).
   */
  protected _fontFamily: Map<string, string> = new Map();
  /**
   * Returns special font family for the provided context or the default font family.
   * @param context type or module name (or other context)
   * @returns custom font family for the context or {@link defaultFontFamily}
   */
  public getFontFamily(context: string): string {
    const fontFamily = this._fontFamily.get(context);
    return (
      fontFamily ??
      this.defaultFontFamily
    );
  }
  /**
   * Sets custom font family for the specified context.
   * @param context type or module name
   * @param value font family string
   */
  public setContextFontFamily(context: string, value: string) {
    this._fontFamily.set(context, value);
  }

  /**
   * Default font size.
   */
  public defaultFontSize: FontSize = {
    value: 1,
    units: 'rem',
    step: 0.1
  };

  /**
   * A collection of contextual font sizes.
   */
  private _fontSizes: Map<string, FontSize> = new Map();
  /**
   * Returns a custom font size for the specified context or the default font size.
   * @param context type or module name
   * @returns custom font size or {@link defaultFontSize}
   */
  public getFontSize(context: string): FontSize {
    const fontSize = this._fontSizes.get(context);
    return fontSize ?? this.defaultFontSize;
  }
  /**
   * Sets custom font size for the supplied context.
   * @param context type or module name
   * @param value font size value
   */
  public setContextFontSize(context: string, value: FontSize) {
    this._fontSizes.set(context, value);
  }
}
