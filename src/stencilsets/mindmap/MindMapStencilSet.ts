import { CurvedConnector, StencilSet } from '../../index';
import { CentralTopicStencil } from './stencils/CentralTopicStencil';
import { ItemStencil } from './stencils/ItemStencil';
import { SubTopicStencil } from './stencils/SubTopicStencil';

const mindMapStencilSet = new StencilSet();
mindMapStencilSet.stencilTypes.push(
  {
    stencilType: CentralTopicStencil,
    displayName: 'Central topic',
  },
  {
    stencilType: SubTopicStencil,
    displayName: 'Sub-topic',
  },
  {
    stencilType: ItemStencil,
    displayName: 'Item',
  },
);
mindMapStencilSet.connectorTypes.push({
  connectorType: CurvedConnector,
  displayName: 'Curved connector',
});

export { mindMapStencilSet };
