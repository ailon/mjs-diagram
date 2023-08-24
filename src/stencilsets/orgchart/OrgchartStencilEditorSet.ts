import { AngledConnector, ConnectorBase, CurvedConnector, LabelStencil, RectangleTextStencil } from "../../core";
import { CustomImageStencilEditor, StencilEditorSet, TextStencilEditor } from "../../editor";
import { orgchartStencilSet } from "./OrgchartStencilSet";

/**
 * Organizational chart editor set.
 */
const orgchartStencilEditorSet = new StencilEditorSet('orgchart', orgchartStencilSet);
orgchartStencilEditorSet.displayName = 'Org. chart';
orgchartStencilEditorSet.defaultStencilEditor = CustomImageStencilEditor;
orgchartStencilEditorSet.addStencilEditor(TextStencilEditor, LabelStencil, RectangleTextStencil);

orgchartStencilEditorSet.availableConnectorTypes = [
  AngledConnector, ConnectorBase, CurvedConnector
];
orgchartStencilEditorSet.defaultConnectorType = AngledConnector;

orgchartStencilEditorSet.newDocumentTemplate = {
  width: 640,
  height: 360,
  stencils: [],
  connectors: [],
};

export { orgchartStencilEditorSet };
