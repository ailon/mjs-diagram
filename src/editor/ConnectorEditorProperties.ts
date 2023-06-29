import { ConnectorBase } from "../core";
import { EditorSettings } from "./EditorSettings";
import { Language } from "./Language";

/**
 * Represents properties passed to the connector editor constructor.
 * 
 * @see {@link editor!ConnectorBaseEditor}
 */
export interface ConnectorEditorProperties {
  /**
   * Internal identifier for the connector.
   */
  iid: number,
  /**
   * SVG container for the connector and editor elements.
   */
  container: SVGGElement,
  /**
   * HTML overlay container for editor's elements (such as label text editor).
   */
  overlayContainer: HTMLDivElement,
  /**
   * Settings for the editor.
   */
  settings: EditorSettings,
  /**
   * Language (localization) subsystem.
   */
  language: Language,
  /**
   * Type of the connector [to create].
   */
  connectorType: typeof ConnectorBase,
  /**
   * Previously created connector to edit.
   */
  connector?: ConnectorBase  
}
