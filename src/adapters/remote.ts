import type { SignalSource, SourceKind } from '../core/types.ts';
export interface ReceiverConnector {
  readonly kind: Exclude<SourceKind, 'demo'>;
  readonly available: boolean;
  connect(endpoint: URL): Promise<SignalSource>;
}
// Deliberately not connected to arbitrary endpoints. Future adapters require explicit operator permission.
export const remoteConnector: ReceiverConnector = {
  kind: 'remote', available: false,
  async connect() { throw new Error('Integración directa pendiente. Abre un receptor desde el directorio externo.'); },
};
export const localBridgeConnector: ReceiverConnector = {
  kind: 'localBridge', available: false,
  async connect() { throw new Error('Puente local no instalado; fase posterior con hardware.'); },
};
