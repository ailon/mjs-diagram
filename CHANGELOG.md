# MJS Diagram Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2023-11-03
### Changed
- [Viewer] viewer's initial animation speed to depend on the number of stencils and connectors

### Fixed
- basicStensilSet missing an angled connector

## [1.3.1] - 2023-10-24
### Fixed
- [Viewer] unnecessary scrollbars would sometimes show up when auto-scaled.

## [1.3.0] - 2023-10-20
### Added
- [Editor] keyboard shortcuts. `Del` or `Backspace` deletes selected objects, `C` toggles connect mode on the selected stencil, `Esc` deselects selected objects, `N` shows add new stencil panel.

### Fixed
- [Viewer] placing viewer in a dynamically sized container inside a flexbox causes an infinite resizing loop

## [1.2.2] - 2023-10-18
### Fixed
- document background color isn't rendered to the static image

## [1.2.1] - 2023-10-13
### Changed 
- text editor bounding boxes to more reasonable (larger) sizes
- logo positioning to hide in small sizes (less than 300x250)

## [1.2.0] - 2023-10-12
### Added
- [Viewer] ability to disable animation after loading diagram in the viewer (`loadAnimationEnabled``)
- [Viewer] `toolbarVisible` setting for the viewer to hide/show toolbar
- `id`` and `displayName`` to stencil sets (potentially breaking for previously user-defined custom stencil sets)

### Fixed
- logo position not adjusted on resize
- missing removeEventListener for custom event types
- [Editor] "x" button icon incorrectly placed in custom image panel
- [Editor] applying stencilset before adding editor to the page causes an error

## [1.1.0] - 2023-09-28
### Added
- [Viewer] auto-scaling of diagrams to fit the component (configurable)
- [Editor] a way to hide unneeded toolbar buttons (`editor.hideToolbarButtons(...)`)

## [1.0.2] - 2023-09-20
### Fixed
- broken text positioning in Safari
- toolbar icons not visible in Safari

## [1.0.1] - 2023-09-19
### Fixed
- incorrect imports from `core` interferring with external `core``
- removed debug output

## [1.0.0] - 2023-09-19
### Added
- custom image stencil added to all stencilsets
- more default colors

### Changed
- updated English strings
- updated Lithuanian translation
- moved `setContextColor()` from `EditorSettings` to `DiagramSettings` (needed for setting contextual defaults in Viewer)

### Fixed
- missing padding in image stencils with label at the top
- hidden image label wasn't hidden on load
- [Viewer] text incorrectly positioned on the first stencil in viewer
- [Editor] language change wasn't reflected in the toolbar
- [Editor] removed toolbar's debug console output

## [1.0.0-beta.7] - 2023-08-25
### Added
- Organizational chart stencilset (`orgchart`)
- `CustomImageStencil` to serve as base class for image based stencils
- `BitamImageStencil` for adding generic custom bitmap images with a caption
- [Editor] text label location panel (`LabelLocationPanel`)
- [Editor] default stencil and connector editor types to stencil editor sets and methods to add an editor for multiple stencil/connector types at once
- [Editor] `CustomImageStencilEditor` for editing image stencils

### Fixed
- impossible to size the components via css
- [Viewer] toolbar covering horizontal scrollbar

### Changed
- production build script to simplify build of stencil sets

## [1.0.0-beta.6] - 2023-08-08
### Changed
- build process to treat mjs-toolbar as external depency. Previous setup caused errors when toolbar was used in both editor and viewer and both were on the same page.

## [1.0.0-beta.5] - 2023-08-07
### Fixed
- broken Viewer build

## [1.0.0-beta.4] - 2023-08-07
### Added
- [Editor] connector stroke property editing
- [Viewer] viewer zooming

### Changed
- [Viewer] the diagram is no positioned in the center of the viewer

### Fixed
- it's not possible to change line style back to solid
- arrow size and possitioning according to connector line width

## [1.0.0-beta.3] - 2023-07-26
### Added
- camera, smartphone, tablet, TV, user stencils to Network diagram stencil set

### Changed
- zoom in and out icons and swapped button positions

## [1.0.0-beta.2] - 2023-07-21
### Added
- `LabelStencil` to Flowchart and MindMap stencil sets

### Fixed
- the rectangle path in rectangle stencils wasn't closed

## [1.0.0-beta.1] - 2023-07-19
### Added
- Class reference (typedoc/jsdoc comments)

### Fixed
- Missing exports
- fix when stencil are placed next to each other "connect" mode isn't switched off when pointer moves to the next stencil

## [1.0.0-beta.0] - 2023-05-15
### Fixed
- touch support
- changing connector type multiplies panels in the toolbox
- leftover test magenta background in the toolbox

### Misc
- some code cleanup

## [1.0.0-alpha.16] - 2023-05-10
### Added
- stencil alignment
- arranging of stencils (bring to front, back, etc.)

## [1.0.0-alpha.15] - 2023-05-04
### Fixed
- attempt to fix a weird runtime error in some setups.

## [1.0.0-alpha.14] - 2023-05-04
### Added
- `ImageStencil` - base type for image based stencils
- `LabelStencil` - a simple text stencil with no frames or backgrounds
- Network diagram (`network`) stencilset

## [1.0.0-alpha.13] - 2023-04-28
### Fixed
- all core types repeated in viewer type declation file resulting in type mismatch errors in TypeScript projects

## [1.0.0-alpha.12] - 2023-04-26
### Changed
- **BREAKING** changed package module structure for better logical separation and separated stencil sets into separate modules.

## [1.0.0-alpha.11] - 2023-04-12
### Added
- viewer events
- core editor events
- localization basics
- stencil set localization subsystem
- more ui color customization variables
- `AngledConnector` and `AngledArrowConnector` (default for flowcharts)

### Changed
- default styles
- css variable prefix to `mjsdiae`

## [1.0.0-alpha.10] - 2023-03-28
### Added
- basic animation in the viewer

### Changed
- most state properties are now option so it's easier to create diagrams from code

## [1.0.0-alpha.9] - 2023-03-22
### Added
- editor settings
- ShapePropertiesPanel meta-panel
- line style panel
- line width panel
- text properties panel
- font family panel
- font size controls

### Changed
- stencil/connector Editor contstructor parameters to a single properties object
- extracted toolbox panel item into a separate class for reuse
- text editing to reflect font styles
- panel layout/look

## [1.0.0-alpha.8] - 2023-03-14
### Added
- document background setting and UI
- document size setting UI

## [1.0.0-alpha.7] - 2023-03-08
### Changed
- internal structures for text rendering and editing
- remove outline in text editor

### Fixed
- z-index from toolbox panel (not needed) was causing layering issues on host pages
- moving connector label got stuck
- connector not deselected when clicked outside
- text editors didn't respect zoom level
- changed opacity during layout to hide jerky text movement
- marquee selection doesn't react to zoom correctly

## [1.0.0-alpha.6] - 2023-03-02
### Added
- marquee selection

### Changed
- creating new stencils to start on pointerdown to enable drag-n-drop-like behavior
- margin on main canvas so edge is visible when zoomed in
- scrollbar styling

### Fixed
- text editing doesn't end when clicking toolbars, toolbox, etc.
- toolbox width isn't fixed
- can't scroll over the whole diagram when zoomed in

## [1.0.0-alpha.5] - 2023-02-24
### Changed
- new stencil panel layout
- new stencil are "placed" on the canvas instead of having to "draw" them

### Fixed
- side ports on IOStencil removed as they were off stencil

## [1.0.0-alpha.4] - 2023-02-21
### Added
- transparent selector frame for better hover handling
- `getSelectorPathD()` method for a \[potentially\] separate selector path
- dropping connector on the stencil connects to the closest port

### Changed
- base stencil frame to be a path and descendants just define the `d` attribute where enough
- `IOStencil` to be based on the base concept with paths
- `SubTopicStencil` to a ronded rectangle
- `TextStencil` to be a frameless text and `RectangleTextStencil` extends it with a rectangular frame

### Fixed
- releasing connecter off of any stencil resulted in orphan connectors

## [1.0.0-alpha.3] - 2023-02-17
### Changed
- **BREAKING!** save button event name from `renderclick` to 'saveclick`
- default stencil text to just 'Text'

### Fixed
- typo on the whole package type definition filename
- component width/height saved in the state instead of document width/height
- no context checks before defining custom elements

## [1.0.0-alpha.2] - 2023-02-14
### Fixed
- stencil set not exported

## [1.0.0-alpha.1] - 2023-02-14
### Added
- Initial public release.

[1.3.2]: https://github.com/ailon/mjs-diagram/releases/tag/v1.3.2
[1.3.1]: https://github.com/ailon/mjs-diagram/releases/tag/v1.3.1
[1.3.0]: https://github.com/ailon/mjs-diagram/releases/tag/v1.3.0
[1.2.2]: https://github.com/ailon/mjs-diagram/releases/tag/v1.2.2
[1.2.1]: https://github.com/ailon/mjs-diagram/releases/tag/v1.2.1
[1.2.0]: https://github.com/ailon/mjs-diagram/releases/tag/v1.2.0
[1.1.0]: https://github.com/ailon/mjs-diagram/releases/tag/v1.1.0
[1.0.2]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.2
[1.0.1]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.1
[1.0.0]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0
[1.0.0-beta.7]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-beta.7
[1.0.0-beta.6]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-beta.6
[1.0.0-beta.5]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-beta.5
[1.0.0-beta.4]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-beta.4
[1.0.0-beta.3]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-beta.3
[1.0.0-beta.2]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-beta.2
[1.0.0-beta.1]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-beta.1
[1.0.0-beta.0]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-beta.0
[1.0.0-alpha.16]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.16
[1.0.0-alpha.15]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.15
[1.0.0-alpha.14]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.14
[1.0.0-alpha.13]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.13
[1.0.0-alpha.12]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.12
[1.0.0-alpha.11]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.11
[1.0.0-alpha.10]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.10
[1.0.0-alpha.9]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.9
[1.0.0-alpha.8]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.8
[1.0.0-alpha.7]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.7
[1.0.0-alpha.6]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.6
[1.0.0-alpha.5]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.5
[1.0.0-alpha.4]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.4
[1.0.0-alpha.3]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.3
[1.0.0-alpha.2]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.2
[1.0.0-alpha.1]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.1