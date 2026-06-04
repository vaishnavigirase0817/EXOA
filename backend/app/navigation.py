"""
Navigation service — corridor-centerline graph topology.
Routes: QR → DOOR → CORRIDOR CENTER → ... → EXIT
All corridor nodes sit in the CENTER of walkable hallway space.
"""
import heapq, math
from .models import GraphDataResponse, PathResponse, NodeModel, EdgeModel, NodeInfo

class NavigationService:
    def __init__(self):
        self.graph = self._load_graph()

    def _load_graph(self) -> dict:
        nodes = [
            {"id":"QR_01","x":195,"y":740,"type":"qr","floor":1,"label":"Class Room 1"},
            {"id":"QR_02","x":365,"y":740,"type":"qr","floor":1,"label":"Class Room 2"},
            {"id":"QR_03","x":535,"y":740,"type":"qr","floor":1,"label":"Class Room 4"},
            {"id":"QR_04","x":705,"y":740,"type":"qr","floor":1,"label":"Class Room 5"},
            {"id":"QR_05","x":875,"y":740,"type":"qr","floor":1,"label":"Class Room 6"},
            {"id":"QR_06","x":950,"y":770,"type":"qr","floor":1,"label":"Class Room 7"},
            {"id":"QR_07","x":1060,"y":635,"type":"qr","floor":1,"label":"Head Office"},
            {"id":"QR_08","x":180,"y":180,"type":"qr","floor":1,"label":"Kitchen"},
            {"id":"QR_09","x":350,"y":140,"type":"qr","floor":1,"label":"Canteen A"},
            {"id":"QR_10","x":585,"y":140,"type":"qr","floor":1,"label":"Canteen A Side"},
            {"id":"QR_11","x":880,"y":170,"type":"qr","floor":1,"label":"Girls Room"},
            {"id":"QR_12","x":130,"y":370,"type":"qr","floor":1,"label":"Unassigned Room"},
            {"id":"QR_13","x":1060,"y":370,"type":"qr","floor":1,"label":"Physics Lab-1"},
            {"id":"DOOR_CR1","x":195,"y":700,"type":"door","floor":1},
            {"id":"DOOR_CR2","x":365,"y":700,"type":"door","floor":1},
            {"id":"DOOR_CR4","x":535,"y":700,"type":"door","floor":1},
            {"id":"DOOR_CR5","x":705,"y":700,"type":"door","floor":1},
            {"id":"DOOR_CR6","x":875,"y":700,"type":"door","floor":1},
            {"id":"DOOR_CR7","x":900,"y":730,"type":"door","floor":1},
            {"id":"DOOR_HO","x":980,"y":635,"type":"door","floor":1},
            {"id":"DOOR_KIT","x":210,"y":230,"type":"door","floor":1},
            {"id":"DOOR_CAN1","x":285,"y":230,"type":"door","floor":1},
            {"id":"DOOR_CAN2","x":585,"y":230,"type":"door","floor":1},
            {"id":"DOOR_GR","x":815,"y":230,"type":"door","floor":1},
            {"id":"DOOR_UA","x":210,"y":405,"type":"door","floor":1},
            {"id":"DOOR_PL","x":980,"y":405,"type":"door","floor":1},
            {"id":"EXIT_01","x":186,"y":47,"type":"exit","floor":1,"label":"North Exit 1"},
            {"id":"EXIT_02","x":264,"y":47,"type":"exit","floor":1,"label":"North Exit 2"},
            {"id":"EXIT_03","x":342,"y":47,"type":"exit","floor":1,"label":"North Exit 3"},
            {"id":"EXIT_04","x":421,"y":47,"type":"exit","floor":1,"label":"North Exit 4"},
            {"id":"EXIT_05","x":499,"y":47,"type":"exit","floor":1,"label":"North Exit 5"},
            {"id":"EXIT_06","x":577,"y":47,"type":"exit","floor":1,"label":"North Exit 6"},
            {"id":"EXIT_07","x":655,"y":47,"type":"exit","floor":1,"label":"North Exit 7"},
            {"id":"EXIT_08","x":734,"y":47,"type":"exit","floor":1,"label":"North Exit 8"},
            {"id":"EXIT_09","x":812,"y":47,"type":"exit","floor":1,"label":"North Exit 9"},
            {"id":"EXIT_10","x":890,"y":47,"type":"exit","floor":1,"label":"North Exit 10"},
            {"id":"EXIT_11","x":1150,"y":100,"type":"exit","floor":1,"label":"East Exit Upper"},
            {"id":"EXIT_12","x":1150,"y":490,"type":"exit","floor":1,"label":"East Exit Mid"},
            {"id":"EXIT_13","x":50,"y":476,"type":"exit","floor":1,"label":"West Exit"},
            {"id":"STAIR_01","x":100,"y":580,"type":"stair","floor":1},
            {"id":"STAIR_02","x":1100,"y":580,"type":"stair","floor":1},
            {"id":"LIFT_01","x":284,"y":425,"type":"lift","floor":1},
            {"id":"LIFT_02","x":281,"y":487,"type":"lift","floor":1},
            {"id":"LIFT_03","x":919,"y":425,"type":"lift","floor":1},
            {"id":"LIFT_04","x":920,"y":485,"type":"lift","floor":1},
            {"id":"COR_T2","x":210,"y":252,"type":"corridor","floor":1},
            {"id":"COR_T3","x":285,"y":252,"type":"corridor","floor":1},
            {"id":"COR_T4","x":450,"y":252,"type":"corridor","floor":1},
            {"id":"COR_T5","x":585,"y":252,"type":"corridor","floor":1},
            {"id":"COR_T6","x":700,"y":252,"type":"corridor","floor":1},
            {"id":"COR_T7","x":815,"y":252,"type":"corridor","floor":1},
            {"id":"COR_B2","x":195,"y":665,"type":"corridor","floor":1},
            {"id":"COR_B3","x":365,"y":665,"type":"corridor","floor":1},
            {"id":"COR_B4","x":535,"y":665,"type":"corridor","floor":1},
            {"id":"COR_B5","x":705,"y":665,"type":"corridor","floor":1},
            {"id":"COR_B6","x":875,"y":665,"type":"corridor","floor":1},
            {"id":"COR_W1","x":250,"y":310,"type":"corridor","floor":1},
            {"id":"COR_W2","x":250,"y":405,"type":"corridor","floor":1},
            {"id":"COR_W3","x":250,"y":465,"type":"corridor","floor":1},
            {"id":"COR_W4","x":250,"y":530,"type":"corridor","floor":1},
            {"id":"COR_W5","x":250,"y":600,"type":"corridor","floor":1},
            {"id":"COR_W6","x":250,"y":650,"type":"corridor","floor":1},
            {"id":"COR_E1","x":945,"y":310,"type":"corridor","floor":1},
            {"id":"COR_E2","x":945,"y":405,"type":"corridor","floor":1},
            {"id":"COR_E3","x":945,"y":490,"type":"corridor","floor":1},
            {"id":"COR_E4","x":945,"y":540,"type":"corridor","floor":1},
            {"id":"COR_E5","x":945,"y":635,"type":"corridor","floor":1},
            {"id":"COR_NW","x":250,"y":252,"type":"corridor","floor":1},
            {"id":"COR_NE","x":945,"y":252,"type":"corridor","floor":1},
            {"id":"COR_SW","x":250,"y":665,"type":"corridor","floor":1},
            {"id":"COR_SE","x":945,"y":665,"type":"corridor","floor":1},
            {"id":"COR_WX","x":130,"y":476,"type":"corridor","floor":1},
            {"id":"COR_EX","x":1060,"y":490,"type":"corridor","floor":1},
            {"id":"COR_CAN_W","x":350,"y":140,"type":"corridor","floor":1},
            {"id":"COR_CAN_M","x":540,"y":140,"type":"corridor","floor":1},
            {"id":"COR_CAN_E","x":734,"y":140,"type":"corridor","floor":1},
            {"id":"COR_KIT","x":180,"y":140,"type":"corridor","floor":1},
            {"id":"COR_GR","x":880,"y":140,"type":"corridor","floor":1},
            {"id":"COR_NE_ACC","x":1090,"y":100,"type":"corridor","floor":1},
            {"id":"COR_NE_COR","x":1060,"y":252,"type":"corridor","floor":1},
            {"id":"COR_WS","x":250,"y":575,"type":"corridor","floor":1},
            {"id":"COR_ES","x":945,"y":515,"type":"corridor","floor":1},
            {"id":"COR_CR7","x":900,"y":665,"type":"corridor","floor":1},
        ]
        node_map = {n["id"]: n for n in nodes}
        def dist(a, b):
            ax, ay = node_map[a]["x"], node_map[a]["y"]
            bx, by = node_map[b]["x"], node_map[b]["y"]
            return round(math.sqrt((ax-bx)**2+(ay-by)**2))
        pairs = [
            ("QR_01","DOOR_CR1"),("QR_02","DOOR_CR2"),("QR_03","DOOR_CR4"),
            ("QR_04","DOOR_CR5"),("QR_05","DOOR_CR6"),("QR_06","DOOR_CR7"),
            ("QR_07","DOOR_HO"),("QR_08","DOOR_KIT"),("QR_09","DOOR_CAN1"),
            ("QR_10","DOOR_CAN2"),("QR_11","DOOR_GR"),("QR_12","DOOR_UA"),
            ("QR_13","DOOR_PL"),
            ("QR_11","COR_GR"),
            ("DOOR_CR1","COR_B2"),("DOOR_CR2","COR_B3"),("DOOR_CR4","COR_B4"),
            ("DOOR_CR5","COR_B5"),("DOOR_CR6","COR_B6"),("DOOR_CR7","COR_CR7"),
            ("DOOR_HO","COR_E5"),
            ("DOOR_KIT","COR_T2"),("DOOR_CAN1","COR_T3"),
            ("DOOR_CAN2","COR_T5"),("DOOR_GR","COR_T7"),
            ("DOOR_UA","COR_W2"),("DOOR_PL","COR_E2"),
            ("COR_T2","COR_NW"),("COR_NW","COR_T3"),
            ("COR_T3","COR_T4"),("COR_T4","COR_T5"),("COR_T5","COR_T6"),
            ("COR_T6","COR_T7"),("COR_T7","COR_NE"),("COR_NE","COR_NE_COR"),
            ("COR_B2","COR_SW"),("COR_SW","COR_B3"),("COR_B3","COR_B4"),
            ("COR_B4","COR_B5"),("COR_B5","COR_B6"),("COR_B6","COR_CR7"),
            ("COR_CR7","COR_SE"),
            ("COR_NW","COR_W1"),("COR_W1","COR_W2"),("COR_W2","COR_W3"),
            ("COR_W3","COR_W4"),("COR_W4","COR_WS"),("COR_WS","COR_W5"),
            ("COR_W5","COR_W6"),("COR_W6","COR_SW"),
            ("COR_NE","COR_E1"),("COR_E1","COR_E2"),("COR_E2","COR_E3"),
            ("COR_E3","COR_ES"),("COR_ES","COR_E4"),
            ("COR_E4","COR_E5"),("COR_E5","COR_SE"),
            ("COR_W3","COR_WX"),("COR_WX","EXIT_13"),
            ("COR_E3","COR_EX"),("COR_EX","EXIT_12"),
            ("DOOR_KIT","COR_KIT"),("COR_KIT","EXIT_01"),("COR_KIT","EXIT_02"),
            ("DOOR_CAN1","COR_CAN_W"),("COR_CAN_W","EXIT_03"),("COR_CAN_W","EXIT_04"),
            ("COR_CAN_W","COR_CAN_M"),("COR_CAN_M","EXIT_05"),
            ("COR_CAN_M","EXIT_06"),("COR_CAN_M","EXIT_07"),
            ("DOOR_CAN2","COR_CAN_M"),
            ("COR_CAN_M","COR_CAN_E"),("COR_CAN_E","EXIT_08"),
            ("DOOR_GR","COR_GR"),("COR_GR","EXIT_09"),("COR_GR","EXIT_10"),
            ("COR_NE_COR","COR_NE_ACC"),("COR_NE_ACC","EXIT_11"),
            ("COR_WS","STAIR_01"),
            ("COR_ES","STAIR_02"),
            ("LIFT_01","COR_W2"),("LIFT_02","COR_W3"),
            ("LIFT_03","COR_E2"),("LIFT_04","COR_E3"),
        ]
        edges = []
        for f, t in pairs:
            edges.append({"from":f,"to":t,"distance":dist(f,t),
                          "blocked":False,"danger_multiplier":1.0,"floor":1})
        return {"nodes": nodes, "edges": edges}

    def _build_adjacency(self, floor):
        adj = {}
        for n in self.graph["nodes"]:
            if n["floor"] == floor: adj[n["id"]] = []
        for e in self.graph["edges"]:
            if e["floor"] != floor or e["blocked"]: continue
            d = e["distance"] * e["danger_multiplier"]
            if e["from"] in adj: adj[e["from"]].append((e["to"], d))
            if e["to"] in adj: adj[e["to"]].append((e["from"], d))
        return adj

    def calculate_shortest_path(self, source, floor=1):
        adj = self._build_adjacency(floor)
        exits = [n["id"] for n in self.graph["nodes"]
                 if n["type"] == "exit" and n["floor"] == floor]
        if source not in adj:
            return PathResponse(path=[], distance=0, exit_node=None, found=False)
        best_path, best_dist, best_exit = None, float("inf"), None
        for eid in exits:
            path, d = self._dijkstra(adj, source, eid)
            if path and d < best_dist:
                best_path, best_dist, best_exit = path, d, eid
        if best_path:
            return PathResponse(path=best_path, distance=round(best_dist),
                                exit_node=best_exit, found=True)
        return PathResponse(path=[], distance=0, exit_node=None, found=False)

    def _dijkstra(self, adj, source, target):
        dm = {source: 0}; prev = {}; pq = [(0, source)]
        while pq:
            d, u = heapq.heappop(pq)
            if d > dm.get(u, float("inf")): continue
            if u == target: break
            for v, w in adj.get(u, []):
                nd = d + w
                if nd < dm.get(v, float("inf")):
                    dm[v] = nd; prev[v] = u
                    heapq.heappush(pq, (nd, v))
        if target not in dm: return None, float("inf")
        path, cur = [], target
        while cur: path.append(cur); cur = prev.get(cur)
        path.reverse()
        return path, dm[target]

    def get_graph_data(self, floor):
        nodes = [NodeModel(**n) for n in self.graph["nodes"] if n["floor"] == floor]
        edges = [EdgeModel(from_node=e["from"], to_node=e["to"], distance=e["distance"],
                 blocked=e["blocked"], danger_multiplier=e["danger_multiplier"],
                 floor=e["floor"]) for e in self.graph["edges"] if e["floor"] == floor]
        return GraphDataResponse(nodes=nodes, edges=edges, floor=floor)

    def get_node_info(self, node_id):
        node = next((n for n in self.graph["nodes"] if n["id"] == node_id), None)
        if not node: return NodeInfo(id=node_id, x=0, y=0, type="unknown", floor=0)
        nbrs = []
        for e in self.graph["edges"]:
            if e["from"] == node_id: nbrs.append(e["to"])
            elif e["to"] == node_id: nbrs.append(e["from"])
        return NodeInfo(**node, neighbors=nbrs)

    def get_exits(self, floor):
        return [n for n in self.graph["nodes"]
                if n["type"] == "exit" and n["floor"] == floor]

    def block_edge(self, from_id, to_id):
        for e in self.graph["edges"]:
            if {e["from"], e["to"]} == {from_id, to_id}: e["blocked"] = True

    def unblock_edge(self, from_id, to_id):
        for e in self.graph["edges"]:
            if {e["from"], e["to"]} == {from_id, to_id}: e["blocked"] = False
