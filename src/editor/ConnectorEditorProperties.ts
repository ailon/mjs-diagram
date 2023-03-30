import { ConnectorBase } from "../core/ConnectorBase";
import { EditorSettings } from "./EditorSettings";
import { Language } from "./Language";

export interface ConnectorEditorProperties {
  iid: number,
  container: SVGGElement,
  overlayContainer: HTMLDivElement,
  settings: EditorSettings,
  language: Language,
  connectorType: typeof ConnectorBase,
  connector?: ConnectorBase  
}
