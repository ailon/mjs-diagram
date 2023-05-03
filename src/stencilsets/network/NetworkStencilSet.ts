import { AngledArrowConnector, ArrowConnector, CurvedArrowConnector, LabelStencil, RectangleTextStencil, StencilSet } from "../../core";

import { NotebookStencil } from "./stencils/NotebookStencil";
import { DesktopStencil } from "./stencils/DesktopStencil";
import { ServerStencil } from "./stencils/ServerStencil";
import { RouterStencil } from "./stencils/RouterStencil";
import { WiFiRouterStencil } from "./stencils/WiFiRouterStencil";
import { CloudStencil } from "./stencils/CloudStencil";
import { DatabaseStencil } from "./stencils/DatabaseStencil";
import { PrinterStencil } from "./stencils/PrinterStencil";

const networkStencilSet = new StencilSet();
networkStencilSet.stencilTypes.push(
  {
    stencilType: NotebookStencil,
    displayName: 'Notebook PC'
  },
  {
    stencilType: DesktopStencil,
    displayName: 'Desktop PC'
  },
  {
    stencilType: ServerStencil,
    displayName: 'Server'
  },
  {
    stencilType: RouterStencil,
    displayName: 'Router'
  },
  {
    stencilType: WiFiRouterStencil,
    displayName: 'WiFi Router'
  },
  {
    stencilType: CloudStencil,
    displayName: 'Cloud'
  },
  {
    stencilType: DatabaseStencil,
    displayName: 'Database'
  },
  {
    stencilType: PrinterStencil,
    displayName: 'Printer'
  },

  {
    stencilType: LabelStencil,
    displayName: 'Label'
  },
  {
    stencilType: RectangleTextStencil,
    displayName: 'Text box',
  },  
);

networkStencilSet.connectorTypes.push(
  {
    connectorType: ArrowConnector,
    displayName: 'Arrow',
  },
  {
    connectorType: CurvedArrowConnector,
    displayName: 'Curved arrow',
  },
  {
    connectorType: AngledArrowConnector,
    displayName: 'Angled arrow',
  }
);

export { networkStencilSet };
