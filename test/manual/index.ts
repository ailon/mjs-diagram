// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DiagramEditor, DiagramState } from '../../src/index';

export * from './../../src/index';

export class Experiments {
  oldState: DiagramState = {
    width: 883,
    height: 352,
    stencils: [
      {
        typeName: 'StencilBase',
        iid: 1,
        left: 174.03123474121094,
        top: 37.333343505859375,
        width: 149.3333282470703,
        height: 88,
        fillColor: '#eeeeee',
        strokeColor: 'black',
        strokeWidth: 1,
        strokeDasharray: '',
      },
      {
        typeName: 'StencilBase',
        iid: 2,
        left: 422.0312805175781,
        top: 128.66668701171875,
        width: 254,
        height: 104,
        fillColor: '#eeeeee',
        strokeColor: 'black',
        strokeWidth: 1,
        strokeDasharray: '',
      },
    ],
    connectors: [
      {
        typeName: 'ConnectorBase',
        iid: 3,
        startStencilId: 1,
        startPortLocation: 'rightcenter',
        endStencilId: 2,
        endPortLocation: 'leftcenter',
        strokeColor: '#3333ff',
        strokeWidth: 1,
        strokeDasharray: '',
      },
    ],
  };

  editor?: DiagramEditor;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public setup(): void {
    this.editor = <DiagramEditor>document.getElementById('mjsDia');

    this.editor.addEventListener('renderclick', (ev) =>
      console.log(JSON.stringify(ev.detail.state))
    );

    document
      .getElementById('restoreStateButton')
      ?.addEventListener('click', () => {
        this.editor?.restoreState(this.oldState);
      });
  }
}
