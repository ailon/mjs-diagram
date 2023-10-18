import { SvgHelper } from "../core";

/**
 * Renders to a flat raster image.
 */
export class Renderer {
    /**
     * Rendered image type (`image/png`, `image/jpeg`, etc.).
     */
    public imageType = 'image/png';
    /**
     * For formats that support it, specifies rendering quality.
     * 
     * In the case of `image/jpeg` you can specify a value between 0 and 1 (lowest to highest quality).
     *
     * @type {number} - image rendering quality (0..1)
     */
    public imageQuality?: number;
    /**
     * Both `width` and `height` have to be set for this to take effect.
     */
    public width?: number;
    /**
     * Both `width` and `height` have to be set for this to take effect.
     */
    public height?: number;


    /**
     * Initiates rendering of the result image and returns a promise which when resolved
     * contains a data URL for the rendered image.
     * 
     * @param diagramImage - SVG diagram
     */
    public rasterize(
        diagramImage: SVGSVGElement,
        targetCanvas?: HTMLCanvasElement 
    ): Promise<string> {
        return new Promise<string>((resolve) => {
            const canvas = targetCanvas !== undefined ? targetCanvas : document.createElement("canvas");

            const diagramImageCopy = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
            );
            diagramImageCopy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            diagramImageCopy.setAttribute('width', diagramImage.width.baseVal.valueAsString);
            diagramImageCopy.setAttribute(
              'height',
              diagramImage.height.baseVal.valueAsString
            );
            diagramImageCopy.setAttribute(
              'viewBox',
              '0 0 ' +
                diagramImage.viewBox.baseVal.width.toString() +
                ' ' +
                diagramImage.viewBox.baseVal.height.toString()
            );
            diagramImageCopy.style.backgroundColor = diagramImage.style.backgroundColor;
            diagramImageCopy.innerHTML = diagramImage.innerHTML;

            // hide editing controls
            const defs = SvgHelper.createDefs();
            diagramImageCopy.insertBefore(defs, diagramImageCopy.firstChild);
            const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
            style.setAttribute('type', 'text/css');
            style.innerHTML = `
                .control-box, .port-box {
                    visibility: hidden;
                }         
            `;
            defs.appendChild(style);

            if (this.width !== undefined && this.height !== undefined) {
                // scale to specific dimensions
                diagramImageCopy.width.baseVal.value = this.width;
                diagramImageCopy.height.baseVal.value = this.height;
            }
    
            canvas.width = diagramImageCopy.width.baseVal.value;
            canvas.height = diagramImageCopy.height.baseVal.value;
    
            const data = diagramImageCopy.outerHTML;

            const ctx = canvas.getContext("2d");
            const DOMURL = window.URL; // || window.webkitURL || window;
    
            const img = new Image(canvas.width, canvas.height);
            img.setAttribute("crossOrigin", "anonymous");
    
            const blob = new Blob([data], { type: "image/svg+xml" });
    
            const url = DOMURL.createObjectURL(blob);
    
            img.onload = () => {
                if (ctx !== null) {
                    ctx.drawImage(img, 0, 0);
                }
                DOMURL.revokeObjectURL(url);
    
                const result = canvas.toDataURL(this.imageType, this.imageQuality ?? 1);
                resolve(result);
            };
    
            img.src = url;
        });
    }
}
