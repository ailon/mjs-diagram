import { ConnectorBase } from './ConnectorBase';
import { CurvedConnector } from './CurvedConnector';
import { DiamondStencil } from './DiamondStencil';
import { EllipseStencil } from './EllipseStencil';
import { StencilBase } from './StencilBase';
import { StencilSet } from './StencilSet';
import { TextStencil } from './TextStencil';

const basicStencilSet = new StencilSet();
basicStencilSet.stencilTypes.push(
  {
    stencilType: StencilBase,
    displayName: 'Basic rectangle',
  },
  {
    stencilType: TextStencil,
    displayName: 'Text box',
  },
  {
    stencilType: EllipseStencil,
    displayName: 'Ellipse',
  },
  {
    stencilType: DiamondStencil,
    displayName: 'Diamond',
  }
  // },{
  //   stencilType: TextStencil,
  //   displayName: 'Text box',
  // },{
  //   stencilType: TextStencil,
  //   displayName: 'Text box',
  // },{
  //   stencilType: TextStencil,
  //   displayName: 'Text box',
  // },{
  //   stencilType: TextStencil,
  //   displayName: 'Text box',
  // },{
  //   stencilType: TextStencil,
  //   displayName: 'Text box',
  // },{
  //   stencilType: TextStencil,
  //   displayName: 'Text box',
  // },{
  //   stencilType: TextStencil,
  //   displayName: 'Text box',
  // },{
  //   stencilType: TextStencil,
  //   displayName: 'Text box',
  // }
);
basicStencilSet.connectorTypes.push(
  {
    connectorType: ConnectorBase,
    displayName: 'Basic connector',
  },
  {
    connectorType: CurvedConnector,
    displayName: 'Curved connector',
  }
);

export { basicStencilSet };
