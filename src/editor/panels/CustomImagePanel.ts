import { Language } from "../Language";
import { PropertyPanelBase } from './PropertyPanelBase';

export type ImageChangeHandler = (newImageSrc?: string) => void;

export class CustomImagePanel extends PropertyPanelBase {
  public currentImageSrc?: string

  public onImageChanged?: ImageChangeHandler;

  private imagePreview?: HTMLDivElement;
  private selectMessageLabel?: HTMLSpanElement;
  private removeButton?: HTMLButtonElement;
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

    this.removeButton = document.createElement('button');
    this.removeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24 width="24" height="24" style="margin: -3px;"><title>close</title><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>';
    this.removeButton.style.width = '24px';
    this.removeButton.style.height = '24px';
    this.removeButton.style.alignSelf = 'flex-start';
    this.removeButton.style.margin = '3px';
    this.removeButton.style.backgroundColor = 'var(--i-mjsdiae-accent-color)';
    this.removeButton.style.borderRadius = '50%';
    this.removeButton.addEventListener('click', (ev) => {
      this.setImageSrc();
      ev.stopPropagation();
    });

    this.selectMessageLabel = document.createElement('span');
    this.selectMessageLabel.style.width = '100%';
    this.selectMessageLabel.style.textAlign = 'center';
    this.selectMessageLabel.innerText = this.language.getString('toolbox-click-to-select-image') ?? 'click to select image';

    this.imagePreview = document.createElement('div');
    this.imagePreview.appendChild(this.removeButton);
    this.imagePreview.appendChild(this.selectMessageLabel);
    this.imagePreview.style.display = 'flex';
    this.imagePreview.style.alignItems = 'center';
    this.imagePreview.style.justifyContent = 'right';
    this.imagePreview.style.width = '200px';
    this.imagePreview.style.height = '200px';
    this.imagePreview.style.border = '1px solid var(--i-mjsdiae-accent-color)';
    this.imagePreview.style.margin = '5px auto';
    this.imagePreview.title = this.language.getString('toolbox-image-title') ?? 'image';
    if (this.currentImageSrc !== undefined) {
      this.imagePreview.style.backgroundImage = `url(${this.currentImageSrc})`;
      this.removeButton.style.display = '';
      this.selectMessageLabel.style.display = 'none';
    } else {
      this.removeButton.style.display = 'none';
      this.selectMessageLabel.style.display = '';
    }
    this.imagePreview.style.backgroundSize = 'contain';
    this.imagePreview.style.backgroundRepeat = 'no-repeat';
    this.imagePreview.style.backgroundPosition = 'center';
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
            }
            this.setImageSrc(ev.target.result);
          }
        });
        reader.readAsDataURL(this.imageFileSelector.files[0]);
      }
    }
  }

  private setImageSrc(value?: string) {
    this.currentImageSrc = value;
    if (this.selectMessageLabel && this.removeButton) {
      if (value !== undefined) {
        this.selectMessageLabel.style.display = 'none';
        this.removeButton.style.display = '';
      } else {
        this.selectMessageLabel.style.display = '';
        this.removeButton.style.display = 'none';
        if (this.imagePreview) {
          this.imagePreview.style.backgroundImage = '';
        }
      }
    }
    if (this.onImageChanged) {
      this.onImageChanged(value);
    }
  }
}
