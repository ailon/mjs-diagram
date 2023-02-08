# MJS Diagram &mdash; add interactive diagrams and diagramming to your web apps

*Note: MJS Diagram is in early stages of its lifecycle and under heavy development. A lot will change before the stable release, including inevitable breaking changes.*

MJS Diagram is a set of web components for creating and dislplaying interactive diagrams, such as Flowcharts, Mind Maps, and others.

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

To add a **diagram editor** to your web app follow these steps:

1. Add a diagram editor web component to your page.
2. Assign a stencil set (diagram type).
3. Setup an event hander for the `renderclick` event to process the results.

### Here's a simple example:

On the page:
```html
<mjs-diagram-editor id="mjsDia"></mjs-diagram-editor>
```
When page loads:

```js
let editor = document.getElementById('mjsDia');

// assign imported Flowchart stencil set
editor.stencilEditorSet = flowchartStencilEditorSet;

editor.addEventListener('renderclick', (ev) => {
  // process state (represents the created diagram)
  console.log(ev.detail.state);
});
```

To add a **diagram viewer** to your web app follow these steps:

1. Add diagram viewer web component to your page.
2. Assign a stencil set (diagram type).
3. Load diagram configuration via the `show()` method.

Here's a simple diagram viewer example:

On your page:

```html
<mjs-diagram-viewer id="mjsDiaView"></mjs-diagram-viewer>
```

When page loads:

```js
let viewer = document.getElementById('mjsDiaView');
// assign imported Flowchart stencil set
viewer.stencilSet = flowchartStencilSet;
// load diagram (state)
viewer.show(savedState);
```

## Demos

*Coming soon...*

## More docs and tutorials

*Coming soon...*

## License
Linkware (see [LICENSE](https://github.com/ailon/mjs-diagram/blob/master/LICENSE) for details) - the UI displays a small link back to the marker.js website which should be retained.

Alternative licenses are available through the [marker.js website](https://markerjs.com).
