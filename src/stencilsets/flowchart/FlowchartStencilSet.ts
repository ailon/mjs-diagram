import { ArrowConnector } from '../../core/ArrowConnector';
import { CurvedArrowConnector } from '../../core/CurvedArrowConnector';
import { StencilSet } from '../../core/StencilSet';
import { DecisionStencil } from './stencils/DecisionStencil';
import { IOStencil } from './stencils/IOStencil';
import { ProcessStencil } from './stencils/ProcessStencil';
import { TerminalStencil } from './stencils/TerminalStencil';

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
  }
);

export { flowchartStencilSet };
