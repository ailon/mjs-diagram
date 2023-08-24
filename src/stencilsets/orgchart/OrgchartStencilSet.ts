import { AngledConnector, ConnectorBase, CurvedConnector, CustomImageStencil, LabelStencil, RectangleTextStencil, StencilSet } from "../../core";
import { OrganizationStencil } from "./stencils/OrganizationStencil";
import { PersonStencil } from "./stencils/PersonStencil";
import { TeamStencil } from "./stencils/TeamStencil";

/**
 * Organizational chart stencils and connectors.
 */
const orgchartStencilSet = new StencilSet();
orgchartStencilSet.stencilTypes.push(
  {
    stencilType: OrganizationStencil,
    displayName: 'Organization'
  },
  {
    stencilType: TeamStencil,
    displayName: 'Team'
  },
  {
    stencilType: PersonStencil,
    displayName: 'Person'
  },
  {
    stencilType: RectangleTextStencil,
    displayName: 'Text box'
  },
  {
    stencilType: LabelStencil,
    displayName: 'Label'
  },
  {
    stencilType: CustomImageStencil,
    displayName: 'Image'
  },
);

orgchartStencilSet.connectorTypes.push(
  {
    connectorType: ConnectorBase,
    displayName: 'Straight connector',
  },
  {
    connectorType: CurvedConnector,
    displayName: 'Curved connector',
  },
  {
    connectorType: AngledConnector,
    displayName: 'Angled connector',
  }
);

export { orgchartStencilSet };