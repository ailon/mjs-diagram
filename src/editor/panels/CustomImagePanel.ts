import { Language } from "../Language";
import { PropertyPanelBase } from './PropertyPanelBase';

export type ImageChangeHandler = (newImageSrc: string) => void;

export class CustomImagePanel extends PropertyPanelBase {
  public currentImageSrc?: string

  public onImageChanged?: ImageChangeHandler;

  private imagePreview?: HTMLDivElement;
  private imageFileSelector?: HTMLInputElement;

  constructor(
    title: string, 
    language: Language,
    currentImageSrc?: string
  ) {
    super(title, language);

    this.currentImageSrc = currentImageSrc;

    this.getUi = this.getUi.bind(this);
    this.imageFileSelected = this.imageFileSelected.bind(this);
    this.setImageSrc = this.setImageSrc.bind(this);
  }

  public getUi(): HTMLDivElement {
    const panelDiv = document.createElement('div');
    panelDiv.style.display = 'flex';
    panelDiv.style.justifyContent = 'space-between';

    this.imageFileSelector = document.createElement('input');
    this.imageFileSelector.type = 'file';
    this.imageFileSelector.accept = 'image/gif, image/jpeg, image/png';
    this.imageFileSelector.style.visibility = 'hidden';
    this.imageFileSelector.style.width = '0px';
    this.imageFileSelector.style.height = '0px';
    this.imageFileSelector.addEventListener('change', this.imageFileSelected)
    panelDiv.appendChild(this.imageFileSelector);

    this.imagePreview = document.createElement('div');
    this.imagePreview.style.display = 'flex';
    this.imagePreview.style.alignItems = 'center';
    this.imagePreview.style.justifyContent = 'center';
    this.imagePreview.style.width = '200px';
    this.imagePreview.style.height = '200px';
    this.imagePreview.style.border = '1px solid var(--i-mjsdiae-accent-color)';
    this.imagePreview.style.margin = '5px auto';
    this.imagePreview.title = this.language.getString('image') ?? 'image';
    if (this.currentImageSrc !== undefined) {
      this.imagePreview.style.backgroundImage = `url(${this.currentImageSrc})`;
    } else {
      this.imagePreview.innerText = this.language.getString('click-to-select') ?? 'click to select image';
    }
    this.imagePreview.style.backgroundSize = 'contain';
    this.imagePreview.addEventListener('click', () => this.imageFileSelector?.click());
    panelDiv.appendChild(this.imagePreview);

    return panelDiv;
  }

  private imageFileSelected() {
    if (this.imageFileSelector) {
      if (this.imageFileSelector.files && this.imageFileSelector.files[0]) {
        const reader = new FileReader();
        reader.addEventListener('load', ev => {
          if (ev.target?.result && typeof ev.target.result === 'string') {
            if (this.imagePreview) {
              this.imagePreview.style.backgroundImage = `url(${ev.target.result})`;
              this.imagePreview.innerText = '';
            }
            this.setImageSrc(ev.target.result);
          }
        });
        reader.readAsDataURL(this.imageFileSelector.files[0]);
      }
    }
  }

  private setImageSrc(value: string) {
    this.currentImageSrc = value;
    if (this.onImageChanged) {
      this.onImageChanged(value);
    }
  }
}
