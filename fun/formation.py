# -*- coding: utf-8 -*-

"Bonjour tout le monde!"

#Calculatrice
3+4
4*6+2-(70*4.154)/10
4 > 10
8 == 10-2
1 != 2
not 1 == 2

#Types de base
'chaine de caract'
"aussi comme ca"
'on '+' peut '+' les additioner aussi'
[1,2,3,4] #list
(1,2,3,4) #tuple
{'a':10,'b':40} #dict
{1,2,3,3} #set (ensemble)
True,False,None

#variables
a = 10
a = a + 10
a += 20
a,b = 2,3

#example: liste
vous = ('alexandre','antoine','maxime','antoine','quentin','julie','antoine')
vous[0]
vous[1:4]
vous[-1]
moi = {'age':21,'tel':02423231,'assos':["FabLab UTC",'EtuSexy']}
moi['age']
moi.get('age')
moi.get('asazea','NOT HERE')

#fonctions intégrées
type(vous) #type de l'object: str (chaine de caractére), list, tuple, dict, set, int, float,...
len(vous) #taille de l'objet
str(10) #converti en chaine de caractére
set(vous)
print(vous) #affiche à l'ecran explicitement
input()

range(20) # -> [1,2,3,...,20]
help(range) #aide
help(vous)
dir(vous)

#struct de controle (attention indentation)
if 'antoine' in vous:
    print("Coucou Antoine!")
elif len(vous) > 4:
    print("Bonjour tout le monde!")
else:
    print("Ya pas grand monde!")

for qqun in vous:
    print("Hello",qqun)

x = 0
while x < 4:
    print(4)
    x += 1

#fonctions
def affiche10fois(x):
    for i in range(10):
        print(x)

def mulParN(x,N=2):
    return x*100000

affiche10fois("On arrive à la fin")
mulParN(1)
mulParN(1,N=10)

#modules
import random
help(random)
random.choice(vous)

#fichier
for line in open("formation.py"):
    print(line.strip())
open("formation.py").read()[:100]

#Ca suffira pour une introduction, mais voilà un aperçu de choses plus avancées:
"bonjour %s" % "Marie"
"Il y a {} {} sur la {}".format(4,'bouteilles','table')
[x*2 for x in range(20) if x*4 % 3 == 0]
reversed(range(20))
with open('formation.py') as f:
    pass
while True:
    break
try:
    1/(1-1)
except:
    print("oops!")
a = lambda x:x*x
a(4) #-> 16

"""
EXO 0: Avoir Python

_ Sous Windows/Mac: http://www.python.org/download/ puis lancer IDLE (puis jouer avec)
_ Sous Linux: Déjà installé, lancer python en ligne de commande

puis: print("Hello world!")

EXO 1: Premier pas

Vous devez afficher ceci à l'écran:

Décolage dans
10...
9...
8...
7...
6...
5...
4...
3...
2...
1...
0...
Décolage!

Indices:
print() pour afficher à l'écran n'importe quoi
boucle while ou for (avec range() et reversed())
str() pour convertir en chaine de caractére n'importe quoi


-> Si vous y arrivez bien à partir de la, passez à l'exercice 2, sinon, voici quelques questions pour vous entrainer:

EXO 1.1: Entrainement

Soit etus = "Damien","Julie","Antoine","Romain","Maxime","Manon","Dorian","Leslie","Raphou","Manou"

_ Combien il-y a t-il d'étudiant ?
Indice: utiliser len
_ Quelle est la moyenne de voyelles par étudiant ?
Indice: aucun!
_ Lister tout les étudiants dont le prénom contient un 'o'
Indice: 'if x in y:'
_ Fait un programme permettant d'ajouter autant d'étudiant que l'on veut puis les afficher
Indice: input() & list.append()

EXO 1.2: Les nombres premiers!

Let's go, afficher les nombres premiers jusqu'à 100!


EXO 2: Moi!
Pré-requis: Téléchargez dam.io/etus.csv dans le même dossier que votre script Python
Structure du fichier: LOGIN;SEMESTRE;UV1,UV2,UV3;PRENOM;NOM

Vous devez afficher les informations vous concernant et le nombre d'étudiants à l'UTC

Indices:
for line in open('etus.csv'): #pour lire ligne par ligne
login,semester,uvs,first_name,last_name = line.strip().split(";") #pour extraire les données de chaque ligne




EXO 3: Entrées utilisateur
Laisse l'utilisateur entrer son semestre (ex: TC07) et liste les UVS que les personnes qui sont dans le même semestre prennent

Indice:
input() pour laisser l'utilisateur entrer une chaine de caractéres



EXO 4: Documentation
Quels sont les 5 prénoms les plus populaires ? Et l'UV la plus populaire ?

Indice:
Lit la documentation de collections.Counter
uvs.split(',') pour la liste les UVs


--- BEAUCOUP PLUS COMPLIQUÉ A PARTIR D'ICI ---

EXO 5: Fichiers (2)
Fichier "dam.io/names.csv": prenom;sex;langue;probabilité

Combien de filles sont en GI ?
Combien d'éspagnols à l'UTC ?

Indice:
Dans l'optique où le fichier etu.csv contiens tout les noms

EXO 6: Graphiques avec matplotlib

Faire un graphique du nombre d'UV par personne (histogramme). Puis, de même mais séparé pour chaque branche.

#example
import matplotlib.pyplot as plt
plt.bar(range(100),[x*x for x in range(100)]) # premier argument: position des barres, deuxiéme: données
plt.show()
"""
