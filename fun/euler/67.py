def max_line(top, bottom):
    print('max line')
    print('top',top)
    print('bottom',bottom)
    for i,v in enumerate(bottom):
        print(i,v)
        if i == 0:
            yield v+top[i]
        elif i >= len(top):
            yield v+top[i-1]
        else:
            yield v+max(top[i-1], top[i])

lines = open('tri.txt').readlines()
for i, line in enumerate(lines):
    lines[i] = [int(x) for x in line.strip().split(' ') ]

for i,line in enumerate(lines):
    if i > 0:
        lines[i] = list(max_line(lines[i-1],line))
        #print(lines[i])

for line in lines:
    print(' '.join([str(x) for x in line]))
print('----')
print(max(lines[-1]))
