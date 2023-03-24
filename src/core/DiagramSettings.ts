import { FontSize } from "./FontSize";
import { ColorType } from "./ColorType";

export class DiagramSettings {
  protected _contextStrings: Map<string, Map<string, string>> = new Map();
  public getContextString(context: string, name: string): string | undefined {
    const contextBucket = this._contextStrings.get(context);
    if (contextBucket !== undefined) {
      return contextBucket.get(name);
    } else {
      return undefined;
    }
  }
  public setContextString(context: string, name: string, value: string) {
    let contextBucket = this._contextStrings.get(context);
    if (contextBucket === undefined) {
      contextBucket = new Map<string, string>();
      this._contextStrings.set(context, contextBucket);
    }
    contextBucket.set(name, value);
  }

  public defaultColor = '#000';
  public defaultTextColor = this.defaultColor;
  public defaultStrokeColor = this.defaultColor;
  public defaultFillColor = '#ccc';
  public defaultBackgroundColor = '#fff';

  protected _colors: Map<string, Map<ColorType, string>> = new Map();
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

  public defaultStrokeDasharray = '';

  public getDashArray(context: string): string {
    return (
      this.getContextString(context, 'strokeDashArray') ??
      this.defaultStrokeDasharray
    );
  }
  public setContextDashArray(context: string, value: string) {
    this.setContextString(context, 'strokeDashArray', value);
  }

  public defaultStrokeWidth = '1';
  public getStrokeWidth(context: string): string {
    return (
      this.getContextString(context, 'strokeWidth') ?? this.defaultStrokeWidth
    );
  }
  public setContextStrokeWidth(context: string, value: string) {
    this.setContextString(context, 'strokeWidth', value);
  }

  public defaultFontFamily = 'Helvetica, Arial, sans-serif';

  protected _fontFamily: Map<string, string> = new Map();
  public getFontFamily(context: string): string {
    const fontFamily = this._fontFamily.get(context);
    return (
      fontFamily ??
      this.defaultFontFamily
    );
  }
  public setContextFontFamily(context: string, value: string) {
    this._fontFamily.set(context, value);
  }

  public defaultFontSize: FontSize = {
    value: 1,
    units: 'rem',
    step: 0.1
  };

  private _fontSizes: Map<string, FontSize> = new Map();
  public getFontSize(context: string): FontSize {
    const fontSize = this._fontSizes.get(context);
    return fontSize ?? this.defaultFontSize;
  }
  public setContextFontSize(context: string, value: FontSize) {
    this._fontSizes.set(context, value);
  }

}