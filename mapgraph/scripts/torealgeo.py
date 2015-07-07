import json,sys

graph = json.load(open(sys.argv[1]))

nodes_by_id = {}
features = []

def coord(node):
    if 'longitude' in node:
        return node['longitude'],node['latitude']
    return node['x'], node['y']

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
    features.append(n)

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
    features.append(e)

print(json.dumps({
  "type": "FeatureCollection",
  "features": features
}, indent=2))