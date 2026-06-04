import { navigationEngine } from '../services/NavigationEngine';
import { getNodeById } from './graphData';

const testNodes = ['QR_01', 'G_QR_01', 'G_QR_02', 'G_QR_03', 'G_QR_04'];
for (const n of testNodes) {
  const result = navigationEngine.calculateRoute(n);
  console.log(`\n=== ${n} → ${result.targetExitId} (dist: ${result.distance}) ===`);
  for (let i = 0; i < result.path.length; i++) {
    const node = getNodeById(result.path[i]);
    console.log(`  ${node?.id.padEnd(12)} (${node?.x}, ${node?.y}) - ${node?.label}`);
  }
}
