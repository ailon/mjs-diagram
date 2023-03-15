import { ConnectorBase } from "../core/ConnectorBase";
import { EditorSettings } from "./EditorSettings";

export interface ConnectorEditorProperties {
  iid: number,
  container: SVGGElement,
  overlayContainer: HTMLDivElement,
  settings: EditorSettings,
  connectorType: typeof ConnectorBase,
  connector?: ConnectorBase  
}
