import { basicStencilSet } from '../core/BasicStencilSet';
import { StencilEditorSet } from './StencilEditorSet';
import { TextStencil } from '../core/TextStencil';
import { TextStencilEditor } from './TextStencilEditor';

const basicStencilEditorSet = new StencilEditorSet(basicStencilSet);
basicStencilEditorSet.stencilEditorTypes.set(TextStencil, TextStencilEditor);

export { basicStencilEditorSet }
