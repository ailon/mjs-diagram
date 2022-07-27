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
  public enabled = true;
  public connectors: ConnectorBase[] = [];
}

