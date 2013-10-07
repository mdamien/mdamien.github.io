import copy
from collections import Counter

class State(dict):
    """
A state contains the previous value of each modified key
and the previous Counter object
"""
    def __init__(self,counter):
        self.counter = counter

class Database():
    """
key-integer Database as a mix of:
_ a first dict (db) containing the key-value data
_ another dict (counter) containing the number of occurence of each value
The two being in sync at any time

Complexity of each function:
GET: O(1)
SET: O(1)
UNSET: O(1)
NUMEQUALTO: O(1)

But, as we maintain two structure, it use more memory than a simple dict database

Transaction system:
To make the TRANSACTION system performant in term of memory, eachprevious state 
is stored as a dict containing:
_ the previous value of each *modified* key (to save up memory)
_ the previous counter object

This method could be more memory efficient by maintaining a list of change of
the counter object too for example (instend of a raw copy)
"""
    def __init__(self):
        self.db = dict()
        self.counter = Counter()
        self.states = []

    def get(self,var):
        return self.db.get(var,False)

    def __set(self,var,value):
        if var in self.db:
            self.counter[self.db[var]] -= 1
        self.db[var] = value
        self.counter[value] += 1

    def set(self,var,value):
        self.__save_state(var)
        self.__set(var,value)

    def __unset(self,var):
        self.counter[self.db[var]] -= 1
        del self.db[var]

    def unset(self,var):
        self.__save_state(var)
        self.__unset(var)

    def numequalto(self,value):
        return self.counter[value]

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
        self.states.append(State(self.counter))

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
    "Simple CLI without error checking / input sanitizing"
    db = Database()
    while True:
        line = raw_input().upper()
        if line == 'END': break
        elif line == 'BEGIN': db.begin()
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
