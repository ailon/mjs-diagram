import { CurvedConnector, EllipseStencil, StencilSet, TextStencil } from '../../index';

const mindMapStencilSet = new StencilSet();
mindMapStencilSet.stencilTypes.push(
  {
    stencilType: EllipseStencil,
    displayName: 'Central topic',
  },
  {
    stencilType: TextStencil,
    displayName: 'Sub-topic',
  },
  
);
mindMapStencilSet.connectorTypes.push({
  connectorType: CurvedConnector,
  displayName: 'Curved connector',
});

export { mindMapStencilSet };
