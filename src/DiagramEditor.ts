export class DiagramEditor extends HTMLElement {
  private _container: HTMLDivElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';

    this._container = document.createElement('div');
    this._container.style.display = 'block';
    this._container.style.width = '100%';
    this._container.style.height = '100%';
    this._container.style.backgroundColor = 'green';

    this._container.setAttribute('part','container');

    this.shadowRoot?.appendChild(this._container);  
  }
}
