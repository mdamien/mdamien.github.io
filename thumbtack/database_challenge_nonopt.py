#!/usr/bin/env python3
import copy

"""
TODO:
NUMEQUALTO in O(log(n))
Atomize values change in transactions
"""

def main():
    db = dict()
    snapshots = []
    while True:
        line = input()
        if line == 'END': break
        if line == "BEGIN":
            snapshots.append(copy.copy(db))
        elif line == "ROLLBACK":
            if snapshots:
                db = snapshots.pop()
            else:
                print("NO TRANSACTION")
        elif line == "COMMIT":
            if snapshots:
                snapshots = []
            else:
                print("NO TRANSACTION")
        else:
            command,args = line.split(' ',1)
            if command == "GET":
                if args in db:
                    print(db[args])
                else:
                    print("NULL")
            elif command == "SET":
                var,value = args.split()
                db[var] = value
            elif command == "NUMEQUALTO":
                print(len([x for x in db.values() if x == args]))

if __name__ == '__main__':
    main()