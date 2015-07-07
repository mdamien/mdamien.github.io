import random, json, sys

N,E = int(sys.argv[1]),int(sys.argv[2])

features = []

nodes = set()

for i in range(N):
    lat = -random.randint(3000,12000)/100
    lng = random.randint(1000,7000)/100
    nodes.add((lat,lng))
    p = {
      "type": "Feature",
      "properties": {
        "marker-color": "#7e7e7e",
        "marker-size": "medium",
        "marker-symbol": "harbor",
        "title":"Node "+str(i)
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          lat,
          lng
        ]
      }
    }
    features.append(p)


nodes = list(nodes)

features_edges = []

for _ in range(E):
    n1,n2 = random.sample(nodes,2)
    e = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": [
            n1,n2
        ]
      }
    }
    features_edges.append(e)


POINTS = {
  "type": "FeatureCollection",
  "features": features
}

EDGES = {
  "type": "FeatureCollection",
  "features": features_edges
}


print("NODES = "+json.dumps(POINTS, indent=2))
print(';')
print("EDGES = "+json.dumps(EDGES, indent=2))