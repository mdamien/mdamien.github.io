import glob, codecs

for filename in glob.glob('demeter/*.mhtml'):
    print(filename)
    with open(filename) as f:
        a = f.read()
        S = '<!DOCTYPE'
        E = '------='
        i = a.find(S)
        j = a.find(E, i)
        b = a[i:j]
        c = b.encode('iso-8859-1')
        d = codecs.decode(c, 'quopri')
        new_filename = filename.replace('.mhtml', '.html')
        with open(new_filename, 'w') as f2:
            f2.write(d.decode('iso-8859-1'))

