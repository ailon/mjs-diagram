/**
 * Color class represents a color used in swatches in the editor UI.
 * In addition to the CSS color value it allows for a custom label to present the color 
 * to the user.
 */
export class Color {
  /**
   * CSS-compatible color value.
   */
  public value: string;

  private _label?: string | undefined;
  /**
   * Returns the label for the color.
   * If custom label isn't set it returns the real color value.
   */
  public get label(): string {
    return this._label ?? this.value;
  }
  /**
   * Sets a custom label (name) for the color.
   */
  public set label(value: string | undefined) {
    this._label = value;
  }

  /**
   * Creates a Color object based on supplied value and optional custom label.
   * @param value 
   * @param label 
   */
  constructor(value: string, label?: string) {
    this.value = value;
    if (label !== undefined) {
      this.label = label;
    }
  }
}
