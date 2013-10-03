#!/usr/bin/env python3
#from bintrees import AVLTree
import copy

class Database():
    """
    key-integer Database as a mix of:
    _ a dict (db) containing the key-value data
    _ an AVLTree of the integers to have an efficient way to count the values
    The two being in sync at any time

    To make the TRANSACTION system performant in term of memory, each
    state is a dict containing the **previous** value of each modified key
    (and None for an unset key)
    """
    def __init__(self):
        self.db = dict()
        #self.tree = AVLTree()
        self.states = []

    def get(self,var):
        return self.db.get(var,False)

    def __set(self,var,value):
        self.db[var] = value
        #self.tree[value] = None #contains only the value

    def set(self,var,value):
        self.__save_state(var)
        self.__set(var,value)

    def __unset(self,var):
        del self.db[var]

    def unset(self,var):
        self.__save_state(var)
        self.__unset(var)

    def numequalto(self,var):
        return len([x for x in self.db if self.db[x] == var]) #TODO: BST search

    def __save_state(self,var):
        if self.states:
            state = self.states[-1]
            if var not in state:
                if var in self.db:
                    state[var] = self.get(var)
                else:
                    state[var] = None

    def commit(self):
        if self.states:
            self.states = []
            return True
        return False

    def begin(self):
        self.states.append(dict())

    def rollback(self):
        if self.states:
            state = self.states.pop()
            for key in state:
                if state[key] == None:
                    self.__unset(key)
                else:
                    self.__set(key,state[key])
            return True
        return False

def CLI():
    db = Database()
    while True:
        line = input()
        if line == 'END': break
        if line == 'BEGIN': db.begin()
        elif line == 'ROLLBACK':
            if not db.rollback():
                print("NO TRANSACTION")
        elif line == "COMMIT":
            if not db.commit():
                print("NO TRANSACTION")
        else:
            command,args = line.split(' ',1)
            if command == "GET":
                x = db.get(args)
                if x:
                    print(x)
                else:
                    print("NULL")
            elif command == "UNSET":
                db.unset(args)
            elif command == "SET":
                var,value = args.split()
                db.set(var,int(value))
            elif command == "NUMEQUALTO":
                print(db.numequalto(int(args)))

if __name__ == '__main__':
    CLI()
