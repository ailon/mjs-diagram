import { Language } from "../Language";

/**
 * Base class for all property panels.
 */
export abstract class PropertyPanelBase {
  /**
   * Panel title.
   */
  public title: string;
  /**
   * Language (localization) subsystem.
   */
  protected language: Language;

  /**
   * Creates a new panel.
   * @param title 
   * @param language 
   */
  constructor(title: string, language: Language) {
    this.title = title;
    this.language = language;
  }
  /**
   * Returns panel UI.
   */
  public abstract getUi(): HTMLDivElement;
}
