import { ConnectorBaseEditor } from './ConnectorBaseEditor';

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
  public connectors: ConnectorBaseEditor[] = [];
}
