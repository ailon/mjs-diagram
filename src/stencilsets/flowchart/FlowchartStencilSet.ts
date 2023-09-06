import { DecisionStencil } from './stencils/DecisionStencil';
import { IOStencil } from './stencils/IOStencil';
import { ProcessStencil } from './stencils/ProcessStencil';
import { TerminalStencil } from './stencils/TerminalStencil';

import { AngledArrowConnector, BitmapImageStencil, LabelStencil } from '../../core';
import { ArrowConnector } from '../../core';
import { CurvedArrowConnector } from '../../core';
import { StencilSet } from '../../core';

/**
 * Stencils and connectors for Flowchart diagrams.
 */
const flowchartStencilSet = new StencilSet();
flowchartStencilSet.stencilTypes.push(
  {
    stencilType: ProcessStencil,
    displayName: 'Process',
  },
  {
    stencilType: DecisionStencil,
    displayName: 'Decision',
  },
  {
    stencilType: IOStencil,
    displayName: 'Input/Output',
  },
  {
    stencilType: TerminalStencil,
    displayName: 'Terminal',
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
flowchartStencilSet.connectorTypes.push(
  {
    connectorType: ArrowConnector,
    displayName: 'Flowline',
  },
  {
    connectorType: CurvedArrowConnector,
    displayName: 'Flow curve',
  },
  {
    connectorType: AngledArrowConnector,
    displayName: 'Angles Flowline',
  }
);

export { flowchartStencilSet };
