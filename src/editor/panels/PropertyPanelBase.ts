import { Language } from "../Language";

/**
 * Base class for all property panels.
 */
export abstract class PropertyPanelBase {
  public title: string;
  protected language: Language;

  constructor(title: string, language: Language) {
    this.title = title;
    this.language = language;
  }
  public abstract getUi(): HTMLDivElement;
}
