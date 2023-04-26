import { DecisionStencil } from './stencils/DecisionStencil';
import { IOStencil } from './stencils/IOStencil';
import { ProcessStencil } from './stencils/ProcessStencil';
import { TerminalStencil } from './stencils/TerminalStencil';

import { AngledArrowConnector } from '../../core';
import { ArrowConnector } from '../../core';
import { CurvedArrowConnector } from '../../core';
import { StencilSet } from '../../core';

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
  }
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
