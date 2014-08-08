import json, requests

def parse_line(line):
    courses = []
    i = 0
    hour_end = 8
    min_end = 0
    while True:
        j = line.find(uv, i)
        if j == -1:
            break

        a = line.find('-', j)
        b = line.find('<br>', a)
        course_type = line[a+1:b] 
        course_type = course_type.replace('/','')
        c = line.find('</td>', b)
        room = line[b+4:c]

        quarters = line.count('_', i, j)
        hour_start = hour_end+quarters*15//60
        min_start = min_end+quarters*15%60

        h = line.rfind('colspan=', 0, j)
        k = line.find(' ', h)
        span = line[h+len('colspan='):k]
        span = span.replace('"','')
        span_mins = int(span)*15
        mins_start = hour_start*60 + min_start
        mins_end = mins_start + span_mins 
        hour_end = mins_end//60
        min_end = mins_end%60
                
        formatted = '%dh%02d-%sh%02d: %s [%s]' % (hour_start, min_start, hour_end, min_end, course_type, room)

        i = j+1

        courses.append({
            'formatted':formatted,
            'h_start':hour_start,
            'm_start':min_start,
            'h_end':hour_end,
            'm_end':min_end,
            'type': course_type,
            'room': room,
        })

    return courses

def parse_file(uv, f):
    day = -1    
    days = 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    schedule = {}
    for line in f:
        if 'colspan="11"' in line:
            day += 1
        if uv in line:
            courses = parse_line(line)
            schedule[days[day].lower()] = courses
    return schedule

schedules = open('scrapa/schedules.html').read().split('%---------------%')
uvs = {}
for schedule in schedules:
    uv, text = schedule.split('||')
    uvs[uv] = parse_file(uv, text.splitlines())

with open('data/uvs_schedules.json','w') as f:
    json.dump(uvs, f, indent=2)
