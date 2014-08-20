import json, itertools

UVS = json.load(open('data/uvs_schedules.json')) 
__necessaries = None

def parse(time):
    return time['h_start']*60+time['m_start'], \
            time['h_end']*60+time['m_end']

def time_overlap(a, b):
    if a['day'] != b['day']:
        return False
    a_s, a_e = parse(a)
    b_s, b_e = parse(b)
    m_s, m_e = max(a_s, b_s), min(a_e, b_e)
    return m_s < m_e
    
def overlap_with_another_time(time, times):
    for time2 in times:
        if time != time2 and time_overlap(time, time2):
            return True, (time, time2)
    return False, None

def have_overlaps(times):
    for i, time in enumerate(times):
        overlap, conflict = overlap_with_another_time(time, times[:i-1]+times[i+1:])
        if overlap:
            return True, conflict
    return False, None

def fingerprint(time):
    return (time['uv'], time['type'])

def valid_combinations(times, all_times):
    #check if comb valid
    if len(times) == len(__necessaries):
        if not have_overlaps(times)[0]:
            yield times
    #else generate other combinations
    elif len(times) < len(__necessaries):
        times_fingerprint = set(fingerprint(time) for time in times)
        #for each time not already used
        for time in all_times:
            if time not in times \
                and fingerprint(time) not in times_fingerprint \
                and fingerprint(time) in __necessaries:
                times_new = times[:]+[time]
                yield from valid_combinations(times_new, all_times)

def basics(all_times):
    return list(time for time in all_times if time['type'] == time['full_type'])

def test(*uvs):
    global __necessaries
    all_times = list(time for uv in uvs for time in UVS[uv])
    __necessaries = set((time['uv'], time['type']) for time in all_times)
    c = 0
    for comb in valid_combinations(basics(all_times), all_times):
        c += 1
    print(c)


def test_overlap():
  a = [{'day': 'lundi',
  'day_index': 0,
  'formatted': '8h00-10h00: D1 [FA413]',
  'full_type': 'D1',
  'h_end': 10,
  'h_start': 8,
  'm_end': 0,
  'm_start': 0,
  'room': 'FA413',
  'type': 'D',
  'uv': 'LA13'},
 {'day': 'lundi',
  'day_index': 0,
  'formatted': '10h15-12h15: D2 [FA406]',
  'full_type': 'D2',
  'h_end': 12,
  'h_start': 10,
  'm_end': 15,
  'm_start': 15,
  'room': 'FA406',
  'type': 'D',
  'uv': 'GE10'},
 {'day': 'mardi',
  'day_index': 1,
  'formatted': '12h30-14h00: C [FA104]',
  'full_type': 'C',
  'h_end': 14,
  'h_start': 12,
  'm_end': 0,
  'm_start': 30,
  'room': 'FA104',
  'type': 'C',
  'uv': 'GE10'}]
  print(have_overlaps(a))


if __name__ == '__main__':
    list(time.update({'uv':uv}) for uv in UVS for time in UVS[uv])
    test('LA13', 'GE10', 'NF16', 'MT22')
