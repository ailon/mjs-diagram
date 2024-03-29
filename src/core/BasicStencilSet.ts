import { ConnectorBase } from './ConnectorBase';
import { CurvedConnector } from './CurvedConnector';
import { DiamondStencil } from './DiamondStencil';
import { EllipseStencil } from './EllipseStencil';
// import { StencilBase } from './StencilBase';
import { StencilSet } from './StencilSet';
import { RectangleTextStencil } from './RectangleTextStencil';
import { LightbulbIconStencil } from './LightbulbIconStencil';
import { LabelStencil } from './LabelStencil';
import { BitmapImageStencil } from './BitmapImageStencil';
import { AngledConnector } from './AngledConnector';

/**
 * Basic stencil set includes all the core stencils and connectors
 * available in MJS Diagram that are not special to any particular
 * diagram type.
 */
const basicStencilSet = new StencilSet('core', 'Basic diagram');
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
    stencilType: LabelStencil,
    displayName: 'Label',
  },
  {
    stencilType: LightbulbIconStencil,
    displayName: 'Lightbulb',
  },
  {
    stencilType: BitmapImageStencil,
    displayName: 'Image',
  },
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
  },
  {
    connectorType: AngledConnector,
    displayName: 'Angled connector',
  }
);

export { basicStencilSet };
