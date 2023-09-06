import { BitmapImageStencil, LabelStencil, StencilSet } from '../../core';

import { MindMapConnector } from './connectors/MindMapConnector';
import { CentralTopicStencil } from './stencils/CentralTopicStencil';
import { ItemStencil } from './stencils/ItemStencil';
import { SubTopicStencil } from './stencils/SubTopicStencil';

/**
 * Mind Map related stencils and connectors.
 */
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
  {
    stencilType: LabelStencil,
    displayName: 'Label'
  },
  {
    stencilType: BitmapImageStencil,
    displayName: 'Image',
  },  
);
mindMapStencilSet.connectorTypes.push({
  connectorType: MindMapConnector,
  displayName: 'Mind map connector',
});

export { mindMapStencilSet };
