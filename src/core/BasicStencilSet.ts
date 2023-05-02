import { ConnectorBase } from './ConnectorBase';
import { CurvedConnector } from './CurvedConnector';
import { DiamondStencil } from './DiamondStencil';
import { EllipseStencil } from './EllipseStencil';
// import { StencilBase } from './StencilBase';
import { StencilSet } from './StencilSet';
import { RectangleTextStencil } from './RectangleTextStencil';
import { LightbulbIconStencil } from './LightbulbIconStencil';

const basicStencilSet = new StencilSet();
basicStencilSet.stencilTypes.push(
  // {
  //   stencilType: StencilBase,
  //   displayName: 'Basic rectangle',
  // },
  {
    stencilType: RectangleTextStencil,
    displayName: 'Text box',
  },
  {
    stencilType: EllipseStencil,
    displayName: 'Ellipse',
  },
  {
    stencilType: DiamondStencil,
    displayName: 'Diamond',
  },
  {
    stencilType: LightbulbIconStencil,
    displayName: 'Lightbulb',
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
