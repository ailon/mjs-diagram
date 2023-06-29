/**
 * Represents a font family (for text properties).
 */
export class FontFamily {
  /**
   * CSS font family string.
   */
  public value: string;

  private _label?: string | undefined;
  /**
   * Get the display label for the font family value.
   */
  public get label(): string {
    return this._label ?? this.value;
  }
  /**
   * Sets the display label for the font family value.
   */
  public set label(value: string | undefined) {
    this._label = value;
  }

  /**
   * Creates a new font family object.
   * @param value CSS font-family setting value.
   * @param label optional label describing the font family.
   */
  constructor(value: string, label?: string) {
    this.value = value;
    if (label !== undefined) {
      this.label = label;
    }
  }
}
