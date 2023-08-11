// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TextStencilState } from '../../src/core/TextStencilState';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { basicStencilEditorSet, DiagramEditor } from '../../src/editor';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { flowchartStencilEditorSet } from '../../src/stencilsets/flowchart/FlowchartStencilEditorSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { flowchartStencilSet } from '../../src/stencilsets/flowchart/FlowchartStencilSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { mindMapStencilSet } from '../../src/stencilsets/mindmap/MindMapStencilSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { mindMapStencilEditorSet } from '../../src/stencilsets/mindmap/MindMapStencilEditorSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DiagramViewer } from '../../src/viewer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ArrowConnector, basicStencilSet, DiagramState } from '../../src/core';
import { ColorSet } from "../../src/editor/ColorSet";
import { ConnectorEventData, DiagramViewerEventData, StencilEventData } from '../../src/DiagramViewer';
import { ConnectorEditorEventData, DiagramEditorEventData, StencilEditorEventData } from '../../src/DiagramEditor';
import lt_core_strings from '../../src/editor/lang/lt';
import lt_flowchart_strings from '../../src/stencilsets/flowchart/lang/lt';
import { networkStencilSet, networkStencilEditorSet } from '../../src/stencilsets/network/network';

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

    this.editor.language.addStrings('core', 'lt', lt_core_strings);
    this.editor.language.addStrings('core', 'ua', [['toolbox-shape-title','Властивості фігури']]);

    this.editor.language.addStrings(flowchartStencilEditorSet.id, 'lt', lt_flowchart_strings);
    this.editor.language.defaultLang = 'lt';

    this.editor.addEventListener('editorinit', () => {
      console.log('editor init');
    });
    this.editor.addEventListener('diagramload', (ev) => {
      console.log(`editor diagram load ${(<DiagramEditorEventData>ev.detail).editor.zoomSteps}`);
    });
    this.editor.addEventListener('statechange', (ev) => {
      console.log(`editor state changed ${JSON.stringify((<DiagramEditorEventData>ev.detail).editor.getState())}`);
    });

    this.editor.addEventListener('stencilclick', (ev) => {
      console.log(`editor stencil click ${(<StencilEditorEventData>ev.detail).stencilEditor.isSelected}`);
    });
    
    this.editor.addEventListener('connectorclick', (ev) => {
      console.log(`editor connector click ${(<ConnectorEditorEventData>ev.detail).connectorEditor.isSelected}`);
    });
    this.editor.addEventListener('connectorpointerenter', (ev) => {
      console.log(`editor connector enter ${(<ConnectorEditorEventData>ev.detail).connectorEditor.isSelected}`);
    });
    
    this.editor.stencilEditorSet = basicStencilEditorSet;
    // this.editor.stencilEditorSet = flowchartStencilEditorSet;
    // this.editor.stencilEditorSet = mindMapStencilEditorSet;
    // this.editor.stencilEditorSet = networkStencilEditorSet;

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.viewer.addEventListener('viewerinit', (ev) => {
      console.log('viewer init');
    });
    this.viewer.addEventListener('diagramload', (ev) => {
      console.log(`diagram load ${(<DiagramViewerEventData>ev.detail).viewer.zoomLevel}`);
    });
    this.viewer.addEventListener('stencilpointerenter', (ev) => {
      console.log(`stencil pointer enter ${(<StencilEventData>ev.detail).stencil.typeName}`);
    });
    this.viewer.addEventListener('stencilpointerleave', (ev) => {
      console.log(`stencil pointer leave ${(<StencilEventData>ev.detail).stencil.typeName}`);
    });
    this.viewer.addEventListener('stencilclick', (ev) => {
      console.log(`stencil click ${(<StencilEventData>ev.detail).stencil.typeName}`);
    });
    this.viewer.addEventListener('connectorpointerenter', (ev) => {
      console.log(`connector pointer enter ${(<ConnectorEventData>ev.detail).connector.typeName}`);
    });
    this.viewer.addEventListener('connectorpointerleave', (ev) => {
      console.log(`connector pointer leave ${(<ConnectorEventData>ev.detail).connector.typeName}`);
    });
    this.viewer.addEventListener('connectorclick', (ev) => {
      console.log(`connector click ${(<ConnectorEventData>ev.detail).connector.typeName}`);
    });

    // this.viewer.stencilSet = flowchartStencilSet;
    this.viewer.stencilSet = basicStencilSet;
    // this.viewer.stencilSet = networkStencilSet;

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
