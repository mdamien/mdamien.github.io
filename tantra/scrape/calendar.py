#input times
#output times ordered by day and on a minimum of timelines
import json, itertools

def group_by(l, f):
    d = {}
    for x in l:
        if f(x) in d:
            d[f(x)].append(x)
        else:
            d[f(x)] = [x]
    return d

def update(d, **things):
    for key, val in things.items():
        d[key] = val
    return d

UVS = json.load(open('data/uvs_schedules.json')) 

uvs = ['NF01', 'NF16', 'LO23']
all_times = list(update(time, uv=uv) for uv in uvs for time in UVS[uv])
grouped_by_day = group_by(all_times, lambda x: x['day_index'])

for day_index, times in grouped_by_day.items():
    print(times[0]['day'])
    for time in times:
        print(time['uv'],time['formatted'])

