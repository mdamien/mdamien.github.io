import json,sys

graph = json.load(open(sys.argv[1]))

nodes_by_id = {}
nodes = []
edges = []

def coord(node):
    if 'longitude' in node:
        return node['longitude'],node['latitude']
    return node['x']/100, node['y']/100

for node in graph['nodes']:
    nodes_by_id[node['id']] = node
    n = {
      "type": "Feature",
      "properties": {
        "marker-color": node.get('color',"#7e7e7e"),
        "marker-size": "medium",
        "marker-symbol": "harbor",
        "title":node['label']
      },
      "geometry": {
        "type": "Point",
        "coordinates": coord(node)
      }
    }
    nodes.append(n)

for edge in graph['edges']:
    s,t = nodes_by_id[edge['source']],nodes_by_id[edge['target']]
    e = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": [
            coord(s),coord(t)
        ]
      }
    }
    edges.append(e)

print("NODES = "+json.dumps({
  "type": "FeatureCollection",
  "features": nodes
}, indent=2)+";")
print("EDGES = "+json.dumps({
  "type": "FeatureCollection",
  "features": edges
}, indent=2))