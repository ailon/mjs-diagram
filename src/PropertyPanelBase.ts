/**
 * Base class for all property panels.
 */
export abstract class PropertyPanelBase {
  public title: string;

  constructor(title: string) {
    this.title = title;
  }
  public abstract getUi(): HTMLDivElement;
}
