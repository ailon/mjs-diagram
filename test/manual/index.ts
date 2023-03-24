// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TextStencilState } from '../../src/core/TextStencilState';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { basicStencilEditorSet, DiagramEditor } from '../../src/editor_index';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { flowchartStencilEditorSet } from '../../src/stencilsets/flowchart/FlowchartStencilEditorSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { flowchartStencilSet } from '../../src/stencilsets/flowchart/FlowchartStencilSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { mindMapStencilSet } from '../../src/stencilsets/mindmap/MindMapStencilSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { mindMapStencilEditorSet } from '../../src/stencilsets/mindmap/MindMapStencilEditorSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ArrowConnector, DiagramState, DiagramViewer } from '../../src/viewer_index';
import { ColorSet } from "../../src/editor/ColorSet";

export * from './../../src/index';

export class Experiments {
  oldState: DiagramState = {
    width: 872,
    height: 752,
    stencils: [
      {
        typeName: 'StencilBase',
        iid: 1,
        left: 39.197906494140625,
        top: 78.33332824707031,
        width: 147.33334350585938,
        height: 90,
        fillColor: '#eeeeee',
        strokeColor: 'black',
        strokeWidth: 1,
        strokeDasharray: '',
      },
      {
        color: '#000000',
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: 5,
        text: 'Textboxuva',
        typeName: 'TextStencil',
        iid: 2,
        left: 382.5312805175781,
        top: 135.6666717529297,
        width: 127.33331298828125,
        height: 114.6666564941406,
        fillColor: '#eeeeee',
        strokeColor: 'black',
        strokeWidth: 1,
        strokeDasharray: '',
      } as TextStencilState,
    ],
    connectors: [
      {
        typeName: 'ConnectorBase',
        iid: 3,
        startStencilId: 1,
        startPortLocation: 'topright',
        endStencilId: 2,
        endPortLocation: 'topleft',
        labelOffsetX: 0,
        labelOffsetY: 0,
        strokeColor: '#3333ff',
        strokeWidth: 1,
        strokeDasharray: '',
      },
      {
        typeName: 'ConnectorBase',
        iid: 4,
        startStencilId: 1,
        startPortLocation: 'bottomright',
        endStencilId: 2,
        endPortLocation: 'bottomleft',
        labelOffsetX: 0,
        labelOffsetY: 0,
        strokeColor: '#3333ff',
        strokeWidth: 1,
        strokeDasharray: '',
      },
    ],
  };

  // oldState: DiagramState = {
  //   width: 883,
  //   height: 352,
  //   stencils: [
  //     {
  //       typeName: 'StencilBase',
  //       iid: 1,
  //       left: 174.03123474121094,
  //       top: 37.333343505859375,
  //       width: 149.3333282470703,
  //       height: 88,
  //       fillColor: '#eeeeee',
  //       strokeColor: 'black',
  //       strokeWidth: 1,
  //       strokeDasharray: '',
  //     },
  //     {
  //       typeName: 'StencilBase',
  //       iid: 2,
  //       left: 422.0312805175781,
  //       top: 128.66668701171875,
  //       width: 254,
  //       height: 104,
  //       fillColor: '#eeeeee',
  //       strokeColor: 'black',
  //       strokeWidth: 1,
  //       strokeDasharray: '',
  //     },
  //   ],
  //   connectors: [
  //     {
  //       typeName: 'ConnectorBase',
  //       iid: 3,
  //       startStencilId: 1,
  //       startPortLocation: 'rightcenter',
  //       endStencilId: 2,
  //       endPortLocation: 'leftcenter',
  //       strokeColor: '#3333ff',
  //       strokeWidth: 1,
  //       strokeDasharray: '',
  //     },
  //   ],
  // };

  editor?: DiagramEditor;
  viewer?: DiagramViewer;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public setup(): void {
    this.editor = <DiagramEditor>document.getElementById('mjsDia');
    
    // this.editor.stencilEditorSet = basicStencilEditorSet;
    this.editor.stencilEditorSet = flowchartStencilEditorSet;
    // this.editor.stencilEditorSet = mindMapStencilEditorSet;

    this.editor.settings.setContextColor('ArrowConnector', 'stroke', 'red');
    this.editor.settings.setContextColorSet('ArrowConnector', 'stroke', new ColorSet('red','blue','black'));

    this.editor.addEventListener('saveclick', (ev) => {
      console.log(JSON.stringify(ev.detail.state));
      this.oldState = ev.detail.state;
      this.viewer?.show(this.oldState);
      this.editor?.render().then((result) => {
        const rasterImg = document.getElementById(
          'rasterDiagram'
        ) as HTMLImageElement;
        if (result !== undefined) {
          rasterImg.src = result;
        }
      });
    });

    document
      .getElementById('restoreStateButton')
      ?.addEventListener('click', () => {
        this.editor?.restoreState(this.oldState);
      });

    this.viewer = <DiagramViewer>document.getElementById('mjsDiaView');
    this.viewer.stencilSet = flowchartStencilSet;

    const manualState: DiagramState = {
      stencils: [
        <TextStencilState>{
          typeName: 'TerminalStencil',
          iid: 1,
          left: 300,
          top: 40,
          text: 'Start'
        },
        <TextStencilState>{
          typeName: 'DecisionStencil',
          iid: 2,
          left: 300,
          top: 140,
          text: 'What\'s up?'
        }
      ],
      connectors: [
        {
          typeName: ArrowConnector.typeName,
          iid: 101,
          startStencilId: 1,
          startPortLocation: 'bottomcenter',
          endStencilId: 2,
          endPortLocation: 'topcenter'
        }
      ]
    }
    this.viewer.show(manualState);
  }
}
