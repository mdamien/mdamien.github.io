import json,sys
with open(sys.argv[1]) as f:
    r = json.dumps(json.load(f), indent=2)
with open(sys.argv[1],'w') as f:
    f.write(r)
