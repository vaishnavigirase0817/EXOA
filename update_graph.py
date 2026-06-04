import re

with open('frontend/src/data/graphData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. First Floor Nodes: Replace QR_01 - QR_13 and delete DOOR nodes
first_floor_qrs = """  // ======== QR NODES (exactly at yellow dots, on door frames) ========
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
  { id: 'QR_13', x: 980, y: 405, type: 'qr' as const, floor: 1, label: 'Physics Lab-1' },"""

content = re.sub(r'  // ======== QR NODES .*?Physics Lab-1\' \},', first_floor_qrs, content, flags=re.DOTALL)
content = re.sub(r'  // ======== DOOR NODES .*?Physics Lab Door\' \},\n', '', content, flags=re.DOTALL)

# First Floor Edges: Replace QR->DOOR and DOOR->COR
first_floor_edges = """    // ===== QR → CORRIDOR CENTER (from door into hallway center) =====
    ['QR_01', 'COR_B2'], ['QR_02', 'COR_B3'], ['QR_03', 'COR_B4'],
    ['QR_04', 'COR_B5'], ['QR_05', 'COR_B6'], ['QR_06', 'COR_CR7'],
    ['QR_07', 'COR_E5'],
    ['QR_08', 'COR_T2'], ['QR_09', 'COR_T3'],
    ['QR_10', 'COR_T5'], ['QR_11', 'COR_T7'],
    ['QR_12', 'COR_W2'], ['QR_13', 'COR_E2'],"""

content = re.sub(r'    // ===== QR → DOOR .*?\[\'DOOR_UA\', \'COR_W2\'\], \[\'DOOR_PL\', \'COR_E2\'\],', first_floor_edges, content, flags=re.DOTALL)

# 2. Ground Floor Nodes
ground_floor_qrs = """  // ======== QR NODES (exactly at the 4 yellow dots) ========
  { id: 'G_QR_01', x: 189, y: 261, type: 'qr' as const, floor: 0, label: 'QR 1 (Admin)' },
  { id: 'G_QR_02', x: 369, y: 349, type: 'qr' as const, floor: 0, label: 'QR 2 (Cabins)' },
  { id: 'G_QR_03', x: 606, y: 354, type: 'qr' as const, floor: 0, label: 'QR 3 (Workshop)' },
  { id: 'G_QR_04', x: 799, y: 355, type: 'qr' as const, floor: 0, label: 'QR 4 (East)' },"""

content = re.sub(r'  // ======== QR NODES .*?Toilet \(East\)\' \},', ground_floor_qrs, content, flags=re.DOTALL)
content = re.sub(r'  // ======== DOOR NODES .*?East Toilet Door\' \},\n', '', content, flags=re.DOTALL)

# Ground Floor Edges
ground_floor_edges = """    // ===== QR → CORRIDOR =====
    ['G_QR_01', 'G_COR_LV1'],  // Connects to Left-V @ Admin (218, 270)
    ['G_QR_02', 'G_COR_BC1'],  // Connects to Bot-C @ Cabins (310, 440)
    ['G_QR_03', 'G_COR_BR1'],  // Connects to Bot-R Mid (663, 440)
    ['G_QR_04', 'G_COR_RV2'],  // Connects to Right-V Mid (788, 355)"""

content = re.sub(r'    // ===== QR → DOOR .*?\[\'G_DOOR_TO2\', \'G_COR_RV1\'\],', ground_floor_edges, content, flags=re.DOTALL)

with open('frontend/src/data/graphData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated graphData.ts successfully.")
