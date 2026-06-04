import type { BuildingGraph } from '../types';
import { euclideanDistance } from '../algorithms/dijkstra';

/**
 * First Floor Graph Data — CORRIDOR-CENTERLINE TOPOLOGY
 *
 * SVG wall analysis (viewBox 0 0 1200 900):
 *   Outer walls: (50,50)-(1150,850)
 *   North room wall: y=230   |  South room wall: y=700
 *   West rooms east wall: x=210  |  East rooms west wall: x=980
 *   Central atrium: (320,320)-(880,580) — NOT walkable
 *   West stair block: (290,350)-(320,550)
 *   East stair block: (880,350)-(910,550)
 *
 * Corridor centerlines (in the CENTER of walkable space):
 *   TOP corridor:    y=252  (center of 230–270 gap)
 *   BOTTOM corridor: y=665  (center of 630–700 gap)
 *   WEST corridor:   x=250  (center of 210–290 gap)
 *   EAST corridor:   x=945  (center of 910–980 gap)
 *
 * North room interiors: y=140 (center of 50–230 canteen/kitchen space)
 *
 * Routing chain: QR → DOOR → CORRIDOR CENTER → ... → EXIT
 */

const firstFloorNodes = [
  // ======== QR NODES (exactly at yellow dots on door frames) ========
  { id: 'QR_01', x: 195, y: 700, type: 'qr' as const, floor: 1, label: 'Class Room 1' },
  { id: 'QR_02', x: 365, y: 700, type: 'qr' as const, floor: 1, label: 'Class Room 2' },
  { id: 'QR_03', x: 535, y: 700, type: 'qr' as const, floor: 1, label: 'Class Room 4' },
  { id: 'QR_04', x: 705, y: 700, type: 'qr' as const, floor: 1, label: 'Class Room 5' },
  { id: 'QR_05', x: 875, y: 700, type: 'qr' as const, floor: 1, label: 'Class Room 6' },
  { id: 'QR_06', x: 900, y: 730, type: 'qr' as const, floor: 1, label: 'Class Room 7' },
  { id: 'QR_07', x: 980, y: 635, type: 'qr' as const, floor: 1, label: 'Head Office' },
  { id: 'QR_08', x: 210, y: 230, type: 'qr' as const, floor: 1, label: 'Kitchen' },
  { id: 'QR_09', x: 285, y: 230, type: 'qr' as const, floor: 1, label: 'Canteen A' },
  { id: 'QR_10', x: 585, y: 230, type: 'qr' as const, floor: 1, label: 'Canteen A Side' },
  { id: 'QR_11', x: 815, y: 230, type: 'qr' as const, floor: 1, label: 'Girls Room' },
  { id: 'QR_12', x: 210, y: 405, type: 'qr' as const, floor: 1, label: 'Unassigned Room' },
  { id: 'QR_13', x: 980, y: 405, type: 'qr' as const, floor: 1, label: 'Physics Lab-1' },

  // ======== EXIT NODES (on outer building walls) ========
  { id: 'EXIT_01', x: 186, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 1' },
  { id: 'EXIT_02', x: 264, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 2' },
  { id: 'EXIT_03', x: 342, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 3' },
  { id: 'EXIT_04', x: 421, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 4' },
  { id: 'EXIT_05', x: 499, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 5' },
  { id: 'EXIT_06', x: 577, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 6' },
  { id: 'EXIT_07', x: 655, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 7' },
  { id: 'EXIT_08', x: 734, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 8' },
  { id: 'EXIT_09', x: 812, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 9' },
  { id: 'EXIT_10', x: 890, y: 47, type: 'exit' as const, floor: 1, label: 'North Exit 10' },
  { id: 'EXIT_11', x: 1150, y: 100, type: 'exit' as const, floor: 1, label: 'East Exit Upper' },
  { id: 'EXIT_12', x: 1150, y: 490, type: 'exit' as const, floor: 1, label: 'East Exit Mid' },
  { id: 'EXIT_13', x: 50, y: 476, type: 'exit' as const, floor: 1, label: 'West Exit' },

  // ======== STAIR & LIFT NODES ========
  { id: 'STAIR_01', x: 115, y: 476, type: 'stair' as const, floor: 1, label: 'West Staircase' },
  { id: 'STAIR_02', x: 1082, y: 490, type: 'stair' as const, floor: 1, label: 'East Staircase' },
  { id: 'LIFT_01', x: 284, y: 425, type: 'lift' as const, floor: 1, label: 'West Lift Upper' },
  { id: 'LIFT_02', x: 281, y: 487, type: 'lift' as const, floor: 1, label: 'West Lift Lower' },
  { id: 'LIFT_03', x: 919, y: 425, type: 'lift' as const, floor: 1, label: 'East Lift Upper' },
  { id: 'LIFT_04', x: 920, y: 485, type: 'lift' as const, floor: 1, label: 'East Lift Lower' },

  // ================================================================
  // CORRIDOR NODES — placed at CENTER of walkable hallway space
  // ================================================================

  // --- TOP CORRIDOR (y=252, centered in 230–270 gap) ---
  // NW end starts at x=250 (the NW junction), no node needed west of that
  { id: 'COR_T2', x: 210, y: 252, type: 'corridor' as const, floor: 1, label: 'Top @ Kitchen Door' },
  { id: 'COR_T3', x: 285, y: 252, type: 'corridor' as const, floor: 1, label: 'Top @ Canteen W' },
  { id: 'COR_T4', x: 450, y: 252, type: 'corridor' as const, floor: 1, label: 'Top Mid' },
  { id: 'COR_T5', x: 585, y: 252, type: 'corridor' as const, floor: 1, label: 'Top @ Canteen E' },
  { id: 'COR_T6', x: 700, y: 252, type: 'corridor' as const, floor: 1, label: 'Top Center' },
  { id: 'COR_T7', x: 815, y: 252, type: 'corridor' as const, floor: 1, label: 'Top @ Girls Room' },

  // --- BOTTOM CORRIDOR (y=665, centered in 630–700 gap) ---
  // Starts at COR_SW (x=250), no node needed west of that (STORES room blocks x<150)
  { id: 'COR_B2', x: 195, y: 665, type: 'corridor' as const, floor: 1, label: 'Bot @ CR1' },
  { id: 'COR_B3', x: 365, y: 665, type: 'corridor' as const, floor: 1, label: 'Bot @ CR2' },
  { id: 'COR_B4', x: 535, y: 665, type: 'corridor' as const, floor: 1, label: 'Bot @ CR4' },
  { id: 'COR_B5', x: 705, y: 665, type: 'corridor' as const, floor: 1, label: 'Bot @ CR5' },
  { id: 'COR_B6', x: 875, y: 665, type: 'corridor' as const, floor: 1, label: 'Bot @ CR6' },
  // COR_SE serves as the east end of the bottom corridor (no separate COR_B7 needed)

  // --- WEST CORRIDOR (x=250, centered in 210–290 gap) ---
  { id: 'COR_W1', x: 250, y: 310, type: 'corridor' as const, floor: 1, label: 'West Upper' },
  { id: 'COR_W2', x: 250, y: 405, type: 'corridor' as const, floor: 1, label: 'West @ UA Door' },
  { id: 'COR_W3', x: 250, y: 465, type: 'corridor' as const, floor: 1, label: 'West Mid' },
  { id: 'COR_W4', x: 250, y: 530, type: 'corridor' as const, floor: 1, label: 'West @ Stair top' },
  { id: 'COR_W5', x: 250, y: 600, type: 'corridor' as const, floor: 1, label: 'West @ Stair bot' },
  { id: 'COR_W6', x: 250, y: 650, type: 'corridor' as const, floor: 1, label: 'West @ Stores' },

  // --- EAST CORRIDOR (x=945, centered in 910–980 gap) ---
  { id: 'COR_E1', x: 945, y: 310, type: 'corridor' as const, floor: 1, label: 'East Upper' },
  { id: 'COR_E2', x: 945, y: 405, type: 'corridor' as const, floor: 1, label: 'East @ PL Door' },
  { id: 'COR_E3', x: 945, y: 490, type: 'corridor' as const, floor: 1, label: 'East Mid' },
  { id: 'COR_E4', x: 945, y: 540, type: 'corridor' as const, floor: 1, label: 'East @ HO top' },
  { id: 'COR_E5', x: 945, y: 635, type: 'corridor' as const, floor: 1, label: 'East @ HO door' },

  // --- CORNER JUNCTIONS (where corridors meet, at centerline intersections) ---
  { id: 'COR_NW', x: 250, y: 252, type: 'corridor' as const, floor: 1, label: 'NW Junction' },
  { id: 'COR_NE', x: 945, y: 252, type: 'corridor' as const, floor: 1, label: 'NE Junction' },
  { id: 'COR_SW', x: 250, y: 665, type: 'corridor' as const, floor: 1, label: 'SW Junction' },
  { id: 'COR_SE', x: 945, y: 665, type: 'corridor' as const, floor: 1, label: 'SE Junction' },

  // --- EXIT ACCESS LATERALS (crossing from corridor center to wall exits) ---
  // West exit: from west corridor center (x=250) → west wall (x=50)
  // Path goes through open space between Unassigned room (y=430 bottom) and Stair room (y=530 top)
  { id: 'COR_WX', x: 130, y: 476, type: 'corridor' as const, floor: 1, label: 'W Exit Access' },
  // East exit: from east corridor center (x=945) → east wall (x=1150)
  // Path goes through open space between Physics Lab (y=440 bottom) and Head Office (y=540 top)
  { id: 'COR_EX', x: 1060, y: 490, type: 'corridor' as const, floor: 1, label: 'E Exit Access' },

  // --- NORTH EXIT ACCESS (through Canteen/Kitchen interior to north wall exits) ---
  // Interior canteen waypoints at y=140 (center of canteen room 50-230)
  { id: 'COR_CAN_W', x: 350, y: 140, type: 'corridor' as const, floor: 1, label: 'Canteen Interior W' },
  { id: 'COR_CAN_M', x: 540, y: 140, type: 'corridor' as const, floor: 1, label: 'Canteen Interior M' },
  { id: 'COR_CAN_E', x: 734, y: 140, type: 'corridor' as const, floor: 1, label: 'Canteen Interior E' },
  // Kitchen interior
  { id: 'COR_KIT', x: 180, y: 140, type: 'corridor' as const, floor: 1, label: 'Kitchen Interior' },
  // Girls Room / NE access interior
  { id: 'COR_GR', x: 880, y: 140, type: 'corridor' as const, floor: 1, label: 'Girls Room Interior' },
  // NE upper exit access (Girls Toilet area: x=1040-1150, y=50-140)
  { id: 'COR_NE_ACC', x: 1090, y: 100, type: 'corridor' as const, floor: 1, label: 'NE Exit Access' },
  // NE corridor connection from top corridor to NE area
  { id: 'COR_NE_COR', x: 1060, y: 252, type: 'corridor' as const, floor: 1, label: 'Top-NE End' },

  // CR7 corridor junction (CR7 door opens south at x=900, y=730)
  { id: 'COR_CR7', x: 900, y: 665, type: 'corridor' as const, floor: 1, label: 'CR7 Junction' },
];

function createEdge(fromId: string, toId: string, nodes: typeof firstFloorNodes) {
  const from = nodes.find(n => n.id === fromId);
  const to = nodes.find(n => n.id === toId);
  if (!from || !to) {
    console.warn(`Edge error: ${fromId} -> ${toId} — node not found`);
    return null;
  }
  return {
    from: fromId, to: toId,
    distance: Math.round(euclideanDistance(from, to)),
    blocked: false, dangerMultiplier: 1, floor: 1,
  };
}

function generateEdges() {
  const pairs: [string, string][] = [
    // ===== QR → CORRIDOR CENTER (from yellow dot to hallway center) =====
    ['QR_01', 'COR_B2'], ['QR_02', 'COR_B3'], ['QR_03', 'COR_B4'],
    ['QR_04', 'COR_B5'], ['QR_05', 'COR_B6'], ['QR_06', 'COR_CR7'],
    ['QR_07', 'COR_E5'],
    ['QR_08', 'COR_T2'], ['QR_09', 'COR_T3'],
    ['QR_10', 'COR_T5'], ['QR_11', 'COR_T7'],
    ['QR_12', 'COR_W2'], ['QR_13', 'COR_E2'],
    // QR_11 also connects to interior node for straight north exit route
    ['QR_11', 'COR_GR'],

    // ===== TOP CORRIDOR (horizontal, y=252) =====
    ['COR_T2', 'COR_NW'], ['COR_NW', 'COR_T3'],
    ['COR_T3', 'COR_T4'], ['COR_T4', 'COR_T5'], ['COR_T5', 'COR_T6'],
    ['COR_T6', 'COR_T7'], ['COR_T7', 'COR_NE'],
    ['COR_NE', 'COR_NE_COR'],

    // ===== BOTTOM CORRIDOR (horizontal, y=665) =====
    // Proper left-to-right: B2(195) → SW(250) → B3(365) → B4(535) → ...
    ['COR_B2', 'COR_SW'], ['COR_SW', 'COR_B3'], ['COR_B3', 'COR_B4'],
    ['COR_B4', 'COR_B5'], ['COR_B5', 'COR_B6'], ['COR_B6', 'COR_CR7'],
    ['COR_CR7', 'COR_SE'],

    // ===== WEST CORRIDOR (vertical, x=250) =====
    ['COR_NW', 'COR_W1'], ['COR_W1', 'COR_W2'], ['COR_W2', 'COR_W3'],
    ['COR_W3', 'COR_W4'], ['COR_W4', 'COR_W5'],
    ['COR_W5', 'COR_W6'], ['COR_W6', 'COR_SW'],

    // ===== EAST CORRIDOR (vertical, x=945) =====
    ['COR_NE', 'COR_E1'], ['COR_E1', 'COR_E2'], ['COR_E2', 'COR_E3'],
    ['COR_E3', 'COR_E4'],
    ['COR_E4', 'COR_E5'], ['COR_E5', 'COR_SE'],

    // ===== WEST EXIT (lateral: corridor center → west wall) =====
    ['COR_W3', 'COR_WX'], ['COR_WX', 'EXIT_13'],

    // ===== EAST EXIT (lateral: corridor center → east wall) =====
    ['COR_E3', 'COR_EX'], ['COR_EX', 'EXIT_12'],

    // ===== NORTH EXITS (through room interiors) =====
    // Kitchen QR → Kitchen Interior → North Exits 1-2
    ['QR_08', 'COR_KIT'], ['COR_KIT', 'EXIT_01'], ['COR_KIT', 'EXIT_02'],
    // Canteen W QR → Canteen Interior → North Exits 3-4
    ['QR_09', 'COR_CAN_W'], ['COR_CAN_W', 'EXIT_03'], ['COR_CAN_W', 'EXIT_04'],
    // Canteen Interior mid → North Exits 5-7
    ['COR_CAN_W', 'COR_CAN_M'], ['COR_CAN_M', 'EXIT_05'],
    ['COR_CAN_M', 'EXIT_06'], ['COR_CAN_M', 'EXIT_07'],
    // Canteen E QR → Canteen Interior → mid
    ['QR_10', 'COR_CAN_M'],
    // Canteen Interior east → North Exits 8
    ['COR_CAN_M', 'COR_CAN_E'], ['COR_CAN_E', 'EXIT_08'],
    // Girls Room QR → Girls Room Interior → North Exits 9-10
    ['QR_11', 'COR_GR'], ['COR_GR', 'EXIT_09'], ['COR_GR', 'EXIT_10'],
    // NE upper exit (East Exit Upper)
    ['COR_NE_COR', 'COR_NE_ACC'], ['COR_NE_ACC', 'EXIT_11'],

    // ===== STAIR ACCESS (from corridor centerline into stair rooms) =====
    ['COR_WX', 'STAIR_01'],
    ['COR_EX', 'STAIR_02'],

    // ===== LIFT ACCESS =====
    ['LIFT_01', 'COR_W2'], ['LIFT_02', 'COR_W3'],
    ['LIFT_03', 'COR_E2'], ['LIFT_04', 'COR_E3'],
  ];

  return pairs
    .map(([from, to]) => createEdge(from, to, firstFloorNodes))
    .filter((e): e is NonNullable<typeof e> => e !== null);
}

const firstFloorEdges = generateEdges();

// ================================================================
// GROUND FLOOR GRAPH DATA
// viewBox: 0 0 1000 600
//
// SVG wall analysis:
//   Outer walls: x=40-975, y=143-528
//   Top rooms (north block): y=105-160 (Server Room, Electrical Room)
//   Horizontal corridor (top): between top inner wall y=160 and
//     Mechanical Workshop north wall y=160 — corridor is the lobby
//     area x=40-250 and x=755-975 on either side of the workshop
//   Mechanical Workshop (central): x=250-755, y=160-295 — NOT walkable
//   Left rooms: x=40-187, y=245-528
//   Right rooms: x=755-975, y=235-528
//   Bottom corridor: y=350-528 center y=440 (between rooms and south wall)
//
// Corridor centerlines:
//   TOP/LOBBY corridor: y=227  (center of 160-295 gap on left/right sides)
//   BOTTOM corridor:    y=440  (center of 350-528 gap)
//   LEFT corridor:      x=218  (center of 187-250 gap)
//   RIGHT corridor:     x=788  (center of 755-822 gap)
//
// ROUTING: Ground floor → STAIR → First floor → EXIT
// No direct exits on ground floor.
// ================================================================

const groundFloorNodes = [
  // ======== QR NODES (exactly at the 4 yellow dots) ========
  { id: 'G_QR_01', x: 189, y: 261, type: 'qr' as const, floor: 0, label: 'Admin Office QR' },
  { id: 'G_QR_02', x: 369, y: 349, type: 'qr' as const, floor: 0, label: 'Workshop West QR' },
  { id: 'G_QR_03', x: 606, y: 354, type: 'qr' as const, floor: 0, label: 'Workshop East QR' },
  { id: 'G_QR_04', x: 799, y: 355, type: 'qr' as const, floor: 0, label: 'East Toilet QR' },

  // ======== STAIR NODES (route target — go up to first floor) ========
  // Left staircase: x=52-137 (center x=94), y=150-245 after scale (center y=197)
  { id: 'G_STAIR_01', x: 94, y: 197, type: 'stair' as const, floor: 0, label: 'West Stairs (Up)', connectedFloorNodeId: 'STAIR_01' },
  // Right staircase: x=865-950 scaled (center x=916), y=150-215 scaled (center y=183)
  { id: 'G_STAIR_02', x: 916, y: 183, type: 'stair' as const, floor: 0, label: 'East Stairs (Up)', connectedFloorNodeId: 'STAIR_02' },

  // ======== LIFT NODES ========
  { id: 'G_LIFT_01', x: 250, y: 202, type: 'lift' as const, floor: 0, label: 'West Lift Upper', connectedFloorNodeId: 'LIFT_01' },
  { id: 'G_LIFT_02', x: 248, y: 252, type: 'lift' as const, floor: 0, label: 'West Lift Lower', connectedFloorNodeId: 'LIFT_02' },
  { id: 'G_LIFT_03', x: 756, y: 204, type: 'lift' as const, floor: 0, label: 'East Lift Upper', connectedFloorNodeId: 'LIFT_03' },
  { id: 'G_LIFT_04', x: 757, y: 248, type: 'lift' as const, floor: 0, label: 'East Lift Lower', connectedFloorNodeId: 'LIFT_04' },

  // ================================================================
  // CORRIDOR NODES — CENTER of walkable hallway space
  // ================================================================

  // --- TOP/LOBBY CORRIDOR LEFT (y=227, x=40 to x=250, left of Workshop) ---
  { id: 'G_COR_TL1', x: 94, y: 227, type: 'corridor' as const, floor: 0, label: 'Lobby-W Stair' },
  { id: 'G_COR_TL2', x: 160, y: 227, type: 'corridor' as const, floor: 0, label: 'Lobby-W Mid' },
  { id: 'G_COR_TL3', x: 218, y: 227, type: 'corridor' as const, floor: 0, label: 'Lobby-W Junction' },

  // --- TOP/LOBBY CORRIDOR RIGHT (y=227, x=755 to x=975, right of Workshop) ---
  { id: 'G_COR_TR1', x: 788, y: 227, type: 'corridor' as const, floor: 0, label: 'Lobby-E Junction' },
  { id: 'G_COR_TR2', x: 875, y: 227, type: 'corridor' as const, floor: 0, label: 'Lobby-E Mid' },
  { id: 'G_COR_TR3', x: 950, y: 227, type: 'corridor' as const, floor: 0, label: 'Lobby-E Stair' },

  // --- NORTH ROOMS ACCESS (y=130 inside server/electrical rooms area) ---
  { id: 'G_COR_SR', x: 240, y: 130, type: 'corridor' as const, floor: 0, label: 'Server Room Interior' },
  { id: 'G_COR_ER', x: 800, y: 130, type: 'corridor' as const, floor: 0, label: 'Electrical Room Interior' },

  // --- LEFT VERTICAL CORRIDOR (x=218, between left rooms and workshop) ---
  { id: 'G_COR_ADMIN_ACC', x: 189, y: 270, type: 'corridor' as const, floor: 0, label: 'Admin Access' },
  { id: 'G_COR_LV1', x: 218, y: 270, type: 'corridor' as const, floor: 0, label: 'Left-V @ Admin' },
  { id: 'G_COR_LV2', x: 218, y: 322, type: 'corridor' as const, floor: 0, label: 'Left-V @ Board' },
  { id: 'G_COR_LV3', x: 218, y: 370, type: 'corridor' as const, floor: 0, label: 'Left-V Mid' },

  // --- BOTTOM CORRIDOR (y=440, between south rooms and south wall) ---
  // Left section: x=40 to x=262 (below left rooms)
  { id: 'G_COR_BL1', x: 115, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-L @ Exit' },
  { id: 'G_COR_BL2', x: 218, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-L Junction' },
  // Central section: x=262 to x=570 (below cabins/cubicles)
  { id: 'G_COR_S2_ACC', x: 311, y: 505, type: 'corridor' as const, floor: 0, label: 'S2 Exit Access' },
  { id: 'G_COR_BC1', x: 364, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-C @ Cabins' },
  { id: 'G_COR_CABIN_TOP', x: 364, y: 349, type: 'corridor' as const, floor: 0, label: 'Cabin Hall Top' },
  { id: 'G_COR_BC2', x: 399, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-C @ Cubicles' },
  { id: 'G_COR_BC3', x: 501, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-C Mid' },
  // Right section: x=570 to x=975
  { id: 'G_COR_WS_E', x: 606, y: 505, type: 'corridor' as const, floor: 0, label: 'Workshop East Access' },
  { id: 'G_COR_BR1', x: 663, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-R Mid' },
  { id: 'G_COR_S6_ACC', x: 767, y: 505, type: 'corridor' as const, floor: 0, label: 'S6 Exit Access' },
  { id: 'G_COR_BR2', x: 788, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-R @ Exit' },
  { id: 'G_COR_BR3', x: 861, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-R @ Exit2' },
  { id: 'G_COR_BR4', x: 950, y: 505, type: 'corridor' as const, floor: 0, label: 'Bot-R East End' },

  // --- RIGHT VERTICAL CORRIDOR (x=788, right side) ---
  { id: 'G_COR_RV1', x: 788, y: 290, type: 'corridor' as const, floor: 0, label: 'Right-V @ Toilet' },
  { id: 'G_COR_RV2', x: 788, y: 355, type: 'corridor' as const, floor: 0, label: 'Right-V Mid' },

  // --- SOUTH EXIT NODES (red dots on south wall y≈528 and west wall x≈40) ---
  // West wall exits (red dots at x=20 on SVG, pushed to x=40)
  { id: 'G_EXIT_W1', x: 40, y: 190, type: 'exit' as const, floor: 0, label: 'West Exit-1' },
  { id: 'G_EXIT_W2', x: 40, y: 270, type: 'exit' as const, floor: 0, label: 'West Exit-2' },
  { id: 'G_EXIT_W3', x: 40, y: 335, type: 'exit' as const, floor: 0, label: 'West Exit-3' },
  // South wall exits
  { id: 'G_EXIT_S1', x: 115, y: 528, type: 'exit' as const, floor: 0, label: 'South Exit-1' },
  { id: 'G_EXIT_S2', x: 311, y: 528, type: 'exit' as const, floor: 0, label: 'South Exit-2 (Main)' },
  { id: 'G_EXIT_S3', x: 399, y: 528, type: 'exit' as const, floor: 0, label: 'South Exit-3' },
  { id: 'G_EXIT_S4', x: 501, y: 528, type: 'exit' as const, floor: 0, label: 'South Exit-4' },
  { id: 'G_EXIT_S5', x: 663, y: 528, type: 'exit' as const, floor: 0, label: 'South Exit-5' },
  { id: 'G_EXIT_S6', x: 767, y: 528, type: 'exit' as const, floor: 0, label: 'South Exit-6' },
  { id: 'G_EXIT_S7', x: 861, y: 528, type: 'exit' as const, floor: 0, label: 'South Exit-7' },
  // East wall exits
  { id: 'G_EXIT_E1', x: 975, y: 184, type: 'exit' as const, floor: 0, label: 'East Exit-1' },
  { id: 'G_EXIT_E2', x: 975, y: 335, type: 'exit' as const, floor: 0, label: 'East Exit-2' },
];

function createGroundEdge(fromId: string, toId: string) {
  const all = [...groundFloorNodes];
  const from = all.find(n => n.id === fromId);
  const to = all.find(n => n.id === toId);
  if (!from || !to) {
    console.warn(`Ground edge error: ${fromId} -> ${toId}`);
    return null;
  }
  return {
    from: fromId, to: toId,
    distance: Math.round(euclideanDistance(from, to)),
    blocked: false, dangerMultiplier: 1, floor: 0,
  };
}

function generateGroundEdges() {
  const pairs: [string, string][] = [
    // ===== QR → CORRIDOR =====
    ['G_QR_01', 'G_COR_ADMIN_ACC'],
    ['G_COR_ADMIN_ACC', 'G_COR_LV1'],
    
    ['G_QR_02', 'G_COR_CABIN_TOP'],
    ['G_COR_CABIN_TOP', 'G_COR_BC1'],
    
    ['G_QR_03', 'G_COR_WS_E'],
    
    ['G_QR_04', 'G_COR_RV2'],

    // ===== LEFT VERTICAL CORRIDOR (x=218) =====
    ['G_COR_TL3', 'G_COR_LV1'], ['G_COR_LV1', 'G_COR_LV2'],
    ['G_COR_LV2', 'G_COR_LV3'], ['G_COR_LV3', 'G_COR_BL2'],

    // ===== TOP LOBBY CORRIDOR LEFT (y=227) =====
    ['G_COR_TL1', 'G_COR_TL2'], ['G_COR_TL2', 'G_COR_TL3'],

    // ===== TOP LOBBY CORRIDOR RIGHT (y=227) =====
    ['G_COR_TR1', 'G_COR_TR2'], ['G_COR_TR2', 'G_COR_TR3'],

    // ===== RIGHT VERTICAL CORRIDOR (x=788) =====
    ['G_COR_TR1', 'G_COR_RV1'], ['G_COR_RV1', 'G_COR_RV2'],
    ['G_COR_RV2', 'G_COR_BR2'],

    // ===== NORTH ROOM INTERIOR ACCESS =====
    ['G_COR_TL2', 'G_COR_SR'], // Server Room access from lobby
    ['G_COR_TR2', 'G_COR_ER'], // Electrical Room access from lobby

    // ===== BOTTOM CORRIDOR (y=440) =====
    ['G_COR_BL1', 'G_COR_BL2'], ['G_COR_BL2', 'G_COR_S2_ACC'],
    ['G_COR_S2_ACC', 'G_COR_BC1'], ['G_COR_BC1', 'G_COR_BC2'],
    ['G_COR_BC2', 'G_COR_BC3'], ['G_COR_BC3', 'G_COR_WS_E'],
    ['G_COR_WS_E', 'G_COR_BR1'], ['G_COR_BR1', 'G_COR_S6_ACC'],
    ['G_COR_S6_ACC', 'G_COR_BR2'], ['G_COR_BR2', 'G_COR_BR3'],
    ['G_COR_BR3', 'G_COR_BR4'],

    // ===== VERTICAL LINKS (connecting top and bottom corridors) =====
    // Left side: lobby → bottom via left corridor
    ['G_COR_BL2', 'G_COR_LV3'],
    // Right side: lobby → bottom via right corridor
    ['G_COR_TR3', 'G_COR_BR4'],

    // ===== STAIR ACCESS =====
    // West stairs from top lobby
    ['G_COR_TL1', 'G_STAIR_01'],
    // East stairs from top lobby right
    ['G_COR_TR3', 'G_STAIR_02'],

    // ===== LIFT ACCESS =====
    ['G_COR_TL3', 'G_LIFT_01'], ['G_COR_TL3', 'G_LIFT_02'],
    ['G_COR_TR1', 'G_LIFT_03'], ['G_COR_TR1', 'G_LIFT_04'],

    // ===== EXITS (south and west walls) =====
    // West wall exits from lobby
    ['G_COR_TL1', 'G_EXIT_W1'],
    ['G_COR_ADMIN_ACC', 'G_EXIT_W2'],
    ['G_COR_LV2', 'G_EXIT_W3'],
    // South wall exits from bottom corridor
    ['G_COR_BL1', 'G_EXIT_S1'],
    ['G_COR_S2_ACC', 'G_EXIT_S2'],
    ['G_COR_BC2', 'G_EXIT_S3'],
    ['G_COR_BC3', 'G_EXIT_S4'],
    ['G_COR_BR1', 'G_EXIT_S5'],
    ['G_COR_S6_ACC', 'G_EXIT_S6'],
    ['G_COR_BR3', 'G_EXIT_S7'],
    // East wall exits from lobby right
    ['G_COR_TR3', 'G_EXIT_E1'],
    ['G_COR_BR4', 'G_EXIT_E2'],
  ];

  return pairs
    .map(([from, to]) => createGroundEdge(from, to))
    .filter((e): e is NonNullable<typeof e> => e !== null);
}

const groundFloorEdges = generateGroundEdges();

// ================================================================
// SECOND FLOOR NODES
// ================================================================
const secondFloorNodes = [
  // QR Nodes (Yellow Dots)
  { id: 'S_QR_01', x: 285, y: 255, type: 'qr' as const, floor: 2, label: 'Computer Center W' },
  { id: 'S_QR_02', x: 535, y: 255, type: 'qr' as const, floor: 2, label: 'Computer Center E' },
  { id: 'S_QR_03', x: 600, y: 255, type: 'qr' as const, floor: 2, label: 'Drawing Hall W' },
  { id: 'S_QR_04', x: 820, y: 255, type: 'qr' as const, floor: 2, label: 'Drawing Hall E' },
  { id: 'S_QR_05', x: 225, y: 707, type: 'qr' as const, floor: 2, label: 'Class Room 1' },
  { id: 'S_QR_06', x: 371, y: 707, type: 'qr' as const, floor: 2, label: 'Class Room 2' },
  { id: 'S_QR_07', x: 516, y: 708, type: 'qr' as const, floor: 2, label: 'Class Room 3' },
  { id: 'S_QR_08', x: 660, y: 708, type: 'qr' as const, floor: 2, label: 'Class Room 4' },
  { id: 'S_QR_09', x: 804, y: 706, type: 'qr' as const, floor: 2, label: 'Class Room 5' },
  { id: 'S_QR_10', x: 896, y: 642, type: 'qr' as const, floor: 2, label: 'HOD Office' },
  { id: 'S_QR_11', x: 904, y: 312, type: 'qr' as const, floor: 2, label: 'Upper East Room' },

  // Stairs (Treated as exits for the second floor)
  { id: 'S_STAIR_01', x: 75, y: 471, type: 'exit' as const, floor: 2, label: 'West Stairs (Down)' },
  { id: 'S_STAIR_02', x: 1046, y: 499, type: 'exit' as const, floor: 2, label: 'East Stairs (Down)' },

  // Corridors (Top Passage y=290, Bottom Passage y=665)
  // West Vertical Passage (x=240)
  { id: 'S_COR_T1', x: 240, y: 290, type: 'corridor' as const, floor: 2, label: 'Top-W Junction' },
  { id: 'S_COR_W1', x: 240, y: 471, type: 'corridor' as const, floor: 2, label: 'West Stair Acc' },
  { id: 'S_COR_B1', x: 240, y: 665, type: 'corridor' as const, floor: 2, label: 'Bot-W Junction' },

  // Top Horizontal Passage
  { id: 'S_COR_T2', x: 285, y: 290, type: 'corridor' as const, floor: 2, label: 'Top-W Mid 1' },
  { id: 'S_COR_T3', x: 535, y: 290, type: 'corridor' as const, floor: 2, label: 'Top-W Mid 2' },
  { id: 'S_COR_T4', x: 600, y: 290, type: 'corridor' as const, floor: 2, label: 'Top-E Mid 1' },
  { id: 'S_COR_T5', x: 820, y: 290, type: 'corridor' as const, floor: 2, label: 'Top-E Mid 2' },

  // East Vertical Passage (x=882)
  { id: 'S_COR_T6', x: 882, y: 290, type: 'corridor' as const, floor: 2, label: 'Top-E Junction' },
  { id: 'S_COR_E1', x: 882, y: 312, type: 'corridor' as const, floor: 2, label: 'East Upper Acc' },
  { id: 'S_COR_E_MID', x: 882, y: 499, type: 'corridor' as const, floor: 2, label: 'East Stair Acc' },
  { id: 'S_COR_E2', x: 882, y: 642, type: 'corridor' as const, floor: 2, label: 'East HOD Acc' },
  { id: 'S_COR_B7', x: 882, y: 665, type: 'corridor' as const, floor: 2, label: 'Bot-E Junction' },

  // Bottom Horizontal Passage
  { id: 'S_COR_B0', x: 225, y: 665, type: 'corridor' as const, floor: 2, label: 'Bot CR1' },
  { id: 'S_COR_B3', x: 371, y: 665, type: 'corridor' as const, floor: 2, label: 'Bot CR2' },
  { id: 'S_COR_B4', x: 516, y: 665, type: 'corridor' as const, floor: 2, label: 'Bot CR3' },
  { id: 'S_COR_B5', x: 660, y: 665, type: 'corridor' as const, floor: 2, label: 'Bot CR4' },
  { id: 'S_COR_B6', x: 804, y: 665, type: 'corridor' as const, floor: 2, label: 'Bot CR5' },
];

function createSecondEdge(fromId: string, toId: string) {
  const all = [...secondFloorNodes];
  const from = all.find(n => n.id === fromId);
  const to = all.find(n => n.id === toId);
  if (!from || !to) return null;
  return {
    from: fromId, to: toId,
    distance: Math.round(euclideanDistance(from, to)),
    blocked: false, dangerMultiplier: 1, floor: 2,
  };
}

function generateSecondEdges() {
  const pairs: [string, string][] = [
    // QR Connections
    ['S_QR_01', 'S_COR_T2'], ['S_QR_02', 'S_COR_T3'],
    ['S_QR_03', 'S_COR_T4'], ['S_QR_04', 'S_COR_T5'],
    ['S_QR_05', 'S_COR_B0'], ['S_QR_06', 'S_COR_B3'],
    ['S_QR_07', 'S_COR_B4'], ['S_QR_08', 'S_COR_B5'],
    ['S_QR_09', 'S_COR_B6'], ['S_QR_10', 'S_COR_E2'],
    ['S_QR_11', 'S_COR_E1'],

    // Top Corridor
    ['S_COR_T1', 'S_COR_T2'], ['S_COR_T2', 'S_COR_T3'],
    ['S_COR_T3', 'S_COR_T4'], ['S_COR_T4', 'S_COR_T5'],
    ['S_COR_T5', 'S_COR_T6'],

    // West Corridor & Stair
    ['S_COR_T1', 'S_COR_W1'], ['S_COR_W1', 'S_COR_B1'],
    ['S_COR_W1', 'S_STAIR_01'],

    // East Corridor & Stair
    ['S_COR_T6', 'S_COR_E1'], ['S_COR_E1', 'S_COR_E_MID'],
    ['S_COR_E_MID', 'S_COR_E2'], ['S_COR_E2', 'S_COR_B7'],
    ['S_COR_E_MID', 'S_STAIR_02'],

    // Bottom Corridor
    ['S_COR_B0', 'S_COR_B1'], ['S_COR_B1', 'S_COR_B3'],
    ['S_COR_B3', 'S_COR_B4'], ['S_COR_B4', 'S_COR_B5'],
    ['S_COR_B5', 'S_COR_B6'], ['S_COR_B6', 'S_COR_B7'],
  ];
  return pairs.map(([f, t]) => createSecondEdge(f, t)).filter((e): e is NonNullable<typeof e> => e !== null);
}

const secondFloorEdges = generateSecondEdges();

// ================================================================
// THIRD FLOOR NODES
// ================================================================
const thirdFloorNodes = [
  // QR Nodes (Yellow Dots)
  { id: 'T_QR_01', x: 295, y: 193, type: 'qr' as const, floor: 3, label: 'Seminar Room - 1' },
  { id: 'T_QR_02', x: 760, y: 197, type: 'qr' as const, floor: 3, label: 'Staff Pantry' },
  { id: 'T_QR_03', x: 832, y: 224, type: 'qr' as const, floor: 3, label: 'Staff Toilet' },
  { id: 'T_QR_04', x: 205, y: 276, type: 'qr' as const, floor: 3, label: 'Language Laboratory' },
  { id: 'T_QR_05', x: 196, y: 515, type: 'qr' as const, floor: 3, label: 'Tutorial Room - 1' },
  { id: 'T_QR_06', x: 345, y: 529, type: 'qr' as const, floor: 3, label: 'Library West' },
  { id: 'T_QR_07', x: 750, y: 532, type: 'qr' as const, floor: 3, label: 'Library East' },
  { id: 'T_QR_08', x: 542, y: 194, type: 'qr' as const, floor: 3, label: 'Class Room - 6' },

  // Stairs (Treated as exits for the third floor)
  { id: 'T_STAIR_01', x: 117, y: 371, type: 'exit' as const, floor: 3, label: 'West Stairs (Down)' },
  { id: 'T_STAIR_02', x: 902, y: 382, type: 'exit' as const, floor: 3, label: 'East Stairs (Down)' },

  // Corridors (Top Passage y=225, Bottom Passage y=500)
  // West Vertical Passage (x=238)
  { id: 'T_COR_T1', x: 238, y: 225, type: 'corridor' as const, floor: 3, label: 'Top-W Junction' },
  { id: 'T_COR_W1', x: 238, y: 371, type: 'corridor' as const, floor: 3, label: 'West Stair Acc' },
  { id: 'T_COR_B1', x: 238, y: 500, type: 'corridor' as const, floor: 3, label: 'Bot-W Junction' },

  // Top Horizontal Passage
  { id: 'T_COR_T2', x: 295, y: 225, type: 'corridor' as const, floor: 3, label: 'Top Seminar Acc' },
  { id: 'T_COR_T3', x: 542, y: 225, type: 'corridor' as const, floor: 3, label: 'Top CR6 Acc' },
  { id: 'T_COR_T4', x: 760, y: 225, type: 'corridor' as const, floor: 3, label: 'Top Pantry Acc' },

  // East Vertical Passage (x=800)
  { id: 'T_COR_T5', x: 800, y: 225, type: 'corridor' as const, floor: 3, label: 'Top-E Junction' },
  { id: 'T_COR_E1', x: 800, y: 382, type: 'corridor' as const, floor: 3, label: 'East Stair Acc' },
  { id: 'T_COR_B2', x: 800, y: 500, type: 'corridor' as const, floor: 3, label: 'Bot-E Junction' },

  // Bottom Horizontal Passage
  { id: 'T_COR_B3', x: 345, y: 500, type: 'corridor' as const, floor: 3, label: 'Bot LibW Acc' },
  { id: 'T_COR_B4', x: 750, y: 500, type: 'corridor' as const, floor: 3, label: 'Bot LibE Acc' },
];

function createThirdEdge(fromId: string, toId: string) {
  const all = [...thirdFloorNodes];
  const from = all.find(n => n.id === fromId);
  const to = all.find(n => n.id === toId);
  if (!from || !to) return null;
  return {
    from: fromId, to: toId,
    distance: Math.round(euclideanDistance(from, to)),
    blocked: false, dangerMultiplier: 1, floor: 3,
  };
}

function generateThirdEdges() {
  const pairs: [string, string][] = [
    // QR Connections
    ['T_QR_01', 'T_COR_T2'],
    ['T_QR_08', 'T_COR_T3'],
    ['T_QR_02', 'T_COR_T4'],
    ['T_QR_03', 'T_COR_T5'],
    ['T_QR_04', 'T_COR_T1'],
    ['T_QR_05', 'T_COR_B1'],
    ['T_QR_06', 'T_COR_B3'],
    ['T_QR_07', 'T_COR_B4'],

    // Top Corridor
    ['T_COR_T1', 'T_COR_T2'], ['T_COR_T2', 'T_COR_T3'],
    ['T_COR_T3', 'T_COR_T4'], ['T_COR_T4', 'T_COR_T5'],

    // West Corridor & Stair
    ['T_COR_T1', 'T_COR_W1'], ['T_COR_W1', 'T_COR_B1'],
    ['T_COR_W1', 'T_STAIR_01'],

    // East Corridor & Stair
    ['T_COR_T5', 'T_COR_E1'], ['T_COR_E1', 'T_COR_B2'],
    ['T_COR_E1', 'T_STAIR_02'],

    // Bottom Corridor
    ['T_COR_B1', 'T_COR_B3'], ['T_COR_B3', 'T_COR_B4'],
    ['T_COR_B4', 'T_COR_B2'],
  ];
  return pairs.map(([f, t]) => createThirdEdge(f, t)).filter((e): e is NonNullable<typeof e> => e !== null);
}

const thirdFloorEdges = generateThirdEdges();

// ================================================================
// CROSS-FLOOR STAIR EDGES (floor 0 ↔ floor 1 ↔ floor 2 ↔ floor 3)
// These link stair nodes to their floor counterparts.
// Distance represents approximate stair travel cost.
// ================================================================
const crossFloorEdges = [
  { from: 'G_STAIR_01', to: 'STAIR_01', distance: 150, blocked: false, dangerMultiplier: 1, floor: -1 },
  { from: 'G_STAIR_02', to: 'STAIR_02', distance: 150, blocked: false, dangerMultiplier: 1, floor: -1 },
  { from: 'STAIR_01', to: 'S_STAIR_01', distance: 150, blocked: false, dangerMultiplier: 1, floor: -1 },
  { from: 'STAIR_02', to: 'S_STAIR_02', distance: 150, blocked: false, dangerMultiplier: 1, floor: -1 },
  { from: 'S_STAIR_01', to: 'T_STAIR_01', distance: 150, blocked: false, dangerMultiplier: 1, floor: -1 },
  { from: 'S_STAIR_02', to: 'T_STAIR_02', distance: 150, blocked: false, dangerMultiplier: 1, floor: -1 },
];

// ================================================================
// MERGED BUILDING GRAPH
// ================================================================
const allNodes = [...firstFloorNodes, ...groundFloorNodes, ...secondFloorNodes, ...thirdFloorNodes];
const allEdges = [...firstFloorEdges, ...groundFloorEdges, ...secondFloorEdges, ...thirdFloorEdges, ...crossFloorEdges];

export const buildingGraph: BuildingGraph = {
  nodes: allNodes,
  edges: allEdges,
  floors: [
    { id: 0, name: 'Ground Floor', svgPath: '/Groundfloor.svg', level: 0 },
    { id: 1, name: 'First Floor', svgPath: '/FirstFloorjk.svg', level: 1 },
    { id: 2, name: 'Second Floor', svgPath: '/secondfloor.svg', level: 2 },
    { id: 3, name: 'Third Floor', svgPath: '/ThirdFloor.svg', level: 3 },
  ],
};

export const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

export function getNodesByType(type: string) {
  return allNodes.filter((n) => n.type === type);
}

export function getNodesByFloor(floor: number) {
  return allNodes.filter((n) => n.floor === floor);
}

export function getNodeById(id: string) {
  return nodeMap.get(id) ?? null;
}

