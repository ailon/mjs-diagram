# MJS Diagram Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0-alpha.8]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.8
[1.0.0-alpha.7]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.7
[1.0.0-alpha.6]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.6
[1.0.0-alpha.5]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.5
[1.0.0-alpha.4]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.4
[1.0.0-alpha.3]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.3
[1.0.0-alpha.2]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.2
[1.0.0-alpha.1]: https://github.com/ailon/mjs-diagram/releases/tag/v1.0.0-alpha.1