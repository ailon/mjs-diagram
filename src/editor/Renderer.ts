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

            const markerImageCopy = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
            );
            markerImageCopy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            markerImageCopy.setAttribute('width', diagramImage.width.baseVal.valueAsString);
            markerImageCopy.setAttribute(
              'height',
              diagramImage.height.baseVal.valueAsString
            );
            markerImageCopy.setAttribute(
              'viewBox',
              '0 0 ' +
                diagramImage.viewBox.baseVal.width.toString() +
                ' ' +
                diagramImage.viewBox.baseVal.height.toString()
            );            
            markerImageCopy.innerHTML = diagramImage.innerHTML;

            if (this.width !== undefined && this.height !== undefined) {
                // scale to specific dimensions
                markerImageCopy.width.baseVal.value = this.width;
                markerImageCopy.height.baseVal.value = this.height;
            }
    
            canvas.width = markerImageCopy.width.baseVal.value;
            canvas.height = markerImageCopy.height.baseVal.value;
    
            const data = markerImageCopy.outerHTML;

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
    
                const result = canvas.toDataURL(this.imageType, this.imageQuality);
                resolve(result);
            };
    
            img.src = url;
        });
    }
}
