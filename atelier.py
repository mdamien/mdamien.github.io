#bases python

3+4
4*6+2-(70*4.154)/10

4 > 10
8 == 10-2
1 != 2

a = 10
b = a*10 + a*0.4

a = int(input('entrer un nombre'))
print(a,'*10 = ',a*10)

l = [1,20,3,10]
len(l) #taille de la liste
l.append(10)

if a > 20:
    print("oula, t'es gourmant")
elif a < 0:
    print("t'es un malin toi")
else:
    print("t'es pas tres gourmant")

if a in l:
    print(a,'est dans',l)

x = 0
while x < 10:
    print(x,x*10)
    x += 1

for x in range(3): #range(4) -> [1,2,3]
    print(x,"c'est",x)

def affiche10fois(x):
    for i in range(10):
        print(x)

def mulParN(x,N=2):
    return x*100000

affiche10fois("On arrive à la fin")
mulParN(1)
mulParN(1,N=10)

import random
help(random) #utilise help(n'importe quoi) pour avoir la doc
random.choice([1,2,3,4,5])
random.random() #-> nombre aleatoire entre 0 et 1


# https://docs.python.org/3.4/library/turtle.html
from turtle import * #importe toute les fonctions de turtle

forward(40)
right(45)
color('red')
forward(40)
left(10)
backward(10)

# le reste est sur la doc!

done() 

