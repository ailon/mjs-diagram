import { basicStencilSet } from './BasicStencilSet';
import { StencilEditorSet } from './StencilEditorSet';
import { TextStencil } from './TextStencil';
import { TextStencilEditor } from './TextStencilEditor';

const basicStencilEditorSet = new StencilEditorSet(basicStencilSet);
basicStencilEditorSet.stencilEditorTypes.set(TextStencil, TextStencilEditor);

export { basicStencilEditorSet }
