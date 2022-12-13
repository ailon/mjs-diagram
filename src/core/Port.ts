import { ConnectorBase } from './ConnectorBase';

export type PortLocation =
  | 'topleft'
  | 'topcenter'
  | 'topright'
  | 'leftcenter'
  | 'rightcenter'
  | 'bottomleft'
  | 'bottomcenter'
  | 'bottomright';

export class Port {
  public location: PortLocation;
  public enabled = true;
  public connectors: ConnectorBase[] = [];
  public x = 0;
  public y = 0;

  constructor(location: PortLocation) {
    this.location = location;

    this.removeConnector = this.removeConnector.bind(this);
  }

  public removeConnector(connector: ConnectorBase): void {
    const ci = this.connectors.indexOf(connector);
    if (ci > -1) {
      this.connectors.splice(ci, 1);
    }
  }
}

