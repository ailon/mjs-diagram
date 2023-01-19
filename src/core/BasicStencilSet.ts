import { CurvedConnector } from './CurvedConnector';
import { StencilSet } from './StencilSet';
import { TextStencil } from './TextStencil';

const basicStencilSet = new StencilSet();
basicStencilSet.stencilTypes.push({
  stencilType: TextStencil,
  displayName: 'Text box',
}
// ,{
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
// },{
//   stencilType: TextStencil,
//   displayName: 'Text box',
// }
);
basicStencilSet.connectorTypes.push({
  connectorType: CurvedConnector,
  displayName: 'Curved connector'
});

export { basicStencilSet };