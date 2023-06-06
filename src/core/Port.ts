import { ConnectorBase } from './ConnectorBase';

/**
 * Represents a location of a port on a rectangular stencil frame.
 */
export type PortLocation =
  | 'topleft'
  | 'topcenter'
  | 'topright'
  | 'leftcenter'
  | 'rightcenter'
  | 'bottomleft'
  | 'bottomcenter'
  | 'bottomright';

/**
 * Port is where connectors connects to a stencil.
 */
export class Port {
  /**
   * Location of the port on the stencils frame.
   */
  public location: PortLocation;
  /**
   * Is this port enabled. When set to false the port will not be visible in the connection mode
   * in the {@link editor!DiagramEditor}.
   */
  public enabled = true;
  /**
   * Connecrtors connected to the port.
   */
  public connectors: ConnectorBase[] = [];
  /**
   * Horizontal coordinate of the port within the stencil.
   */
  public x = 0;
  /**
   * Vertical coordinate of the port within the stencil.
   */
  public y = 0;

  /**
   * {@inheritDoc core!ConnectorBase.constructor}
   */  
  constructor(location: PortLocation) {
    this.location = location;

    this.removeConnector = this.removeConnector.bind(this);
  }

  /**
   * Removes the supplied connector from the port.
   * @param connector connector to remove
   */
  public removeConnector(connector: ConnectorBase): void {
    const ci = this.connectors.indexOf(connector);
    if (ci > -1) {
      this.connectors.splice(ci, 1);
    }
  }
}

