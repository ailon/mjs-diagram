
export class FontFamily {
  public value: string;

  private _label?: string | undefined;
  public get label(): string {
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
