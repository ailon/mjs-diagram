# MJS Diagram &mdash; add interactive diagrams and diagramming to your web apps

MJS Diagram is a set of web components for creating and dislplaying interactive diagrams, such as Flowcharts, Mind Maps, Network Diagrams, and other.

MJS Diagram is extensible and enables you to add your own diagram types.

## Installation

```
npm install @markerjs/mjs-diagram
```

or 

```
yarn add @markerjs/mjs-diagram
```


## Usage

> See the below scenario in action and full source code [here](https://codesandbox.io/s/mjs-diagram-simple-flowchart-starter-2fwqcv?file=/index.html).

To add a **diagram editor** to your web app follow these steps:

1. Add or import required modules (`@markerjs/mjs-diagram/core`, `@markerjs/mjs-diagram/editor`, and a stencil set (diagram type)).
2. Add a diagram editor web component to your page.
3. Assign a stencil set (diagram type).
4. Setup an event handler for the `saveclick` event to process the results.

### Here's a simple example:

On the page:
```html
<mjs-diagram-editor id="mjsDiaEditor"></mjs-diagram-editor>
```
When page loads:

```js
let editor = document.getElementById('mjsDiaEditor');

// assign imported Flowchart stencil set
editor.stencilEditorSet = flowchartStencilEditorSet;

editor.addEventListener('saveclick', (ev) => {
  // process state (represents the created diagram)
  console.log(ev.detail.state);
});
```

To add a **diagram viewer** to your web app follow these steps:

1. Add or import required modules (`@markerjs/mjs-diagram/core`, `@markerjs/mjs-diagram/viewer`, and a stencil set (diagram type)).
2. Add diagram viewer web component to your page.
3. Assign a stencil set (diagram type).
4. Load diagram configuration via the `show()` method.

Here's a simple diagram viewer example:

On your page:

```html
<mjs-diagram-viewer id="mjsDiaViewer"></mjs-diagram-viewer>
```

When page loads:

```js
let viewer = document.getElementById('mjsDiaViewer');
// assign imported Flowchart stencil set
viewer.stencilSet = flowchartStencilSet;
// load diagram (state)
viewer.show(savedState);
```
## Demos

Check out MJS Diagram demos [here](https://markerjs.com/demos/diagram/getting-started).

## More docs and tutorials

For docs and tutorials head over to [the official website](https://markerjs.com/docs/diagram/getting-started).

## License
Linkware (see [LICENSE](https://github.com/ailon/mjs-diagram/blob/master/LICENSE) for details) - the UI displays a small link back to the marker.js website which should be retained.

Alternative licenses are available through the [marker.js website](https://markerjs.com).
