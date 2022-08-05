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
  }
}

