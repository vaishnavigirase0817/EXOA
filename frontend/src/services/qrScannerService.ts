import { getNodeById } from '../data/graphData';
import type { GraphNode } from '../types';

export class QrScannerService {
  /**
   * Validates if a scanned QR code text corresponds to a valid node in the building graph.
   * EXOA QR codes can represent room check-points ('qr') or exits ('exit').
   */
  validateQrCode(qrText: string): { isValid: boolean; node: GraphNode | null; error?: string } {
    const trimmed = qrText.trim();
    if (!trimmed) {
      return { isValid: false, node: null, error: 'Empty QR code value' };
    }

    const node = getNodeById(trimmed);
    if (!node) {
      return {
        isValid: false,
        node: null,
        error: `Node "${trimmed}" not registered in active building graph.`,
      };
    }

    // EXOA supports scanning QR codes representing rooms/nodes
    if (node.type !== 'qr' && node.type !== 'exit' && node.type !== 'stair' && node.type !== 'lift') {
      return {
        isValid: false,
        node: null,
        error: `Node ID "${trimmed}" is registered but is not a physical scanner checkpoint.`,
      };
    }

    return { isValid: true, node };
  }

  /**
   * Helper to format human-readable messages for scanner feedback.
   */
  getSuccessMessage(node: GraphNode): string {
    const floorNames = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];
    const floorLabel = floorNames[node.floor] || `Floor ${node.floor}`;
    return `Checkpoint Verified: ${node.label || node.id} (${floorLabel})`;
  }
}

export const qrScannerService = new QrScannerService();
