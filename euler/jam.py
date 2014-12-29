#https://code.google.com/codejam/contest/7214486/dashboard
from collections import deque
from itertools import combinations

class Matrix:
    @staticmethod
    def from_string(M):
        return Matrix([list(x.strip()) for x in M.split('\n')])
    
    def __init__(self,M):
        self.M = M

    def swap_rows(self,a,b):
        self.M[a], self.M[b] = self.M[b], self.M[a]
        return self

    def swap_cols(self,a,b):
        for i in range(len(self.M)):
            self.M[i][a],self.M[i][b] = self.M[i][b],self.M[i][a]
        return self
    
    def __str__(self):
        s = '------'+'\n'
        for line in self.M:
            s += ''.join(line)+'\n'
        s += '------'+'\n'
        return s
        
    def is_a_checkboard(self):
        prev = None
        for line in self.M:
            for v in line:
                if prev and prev == v:
                    return False
                prev = v
            prev = '0' if prev == '1' else '1'
        return True

    def __eq__(self, other):
        return str(self.M) == str(other.M)
    
    def __hash__(self):
        return hash(str(self.M)) 
        
    def copy(self):
        return Matrix([row[:] for row in self.M])

def test_basic(): #TODO port to doctest
    M = Matrix.from_string("""1001
            0110
            0110
            1001""")
    M.swap_cols(0,1)
    M.swap_rows(0,1)
    assert M.is_a_checkboard()
test_basic()

class Node:
    def __init__(self, M, parent=None):
        self.M = M
        self.parent = parent
    
    def depth(self):
        if self.parent:
            return self.parent.depth() + 1
        return 0
    
    def __str__(self):
        return "--------\ndepth:"+str(self.depth())+"\n"+str(self.M)

def solve(M):
    q = deque([Node(M)])
    seen = set([M])
    while len(q) > 0:
        print len(q)
        node = q.pop()
        if node.M.is_a_checkboard():
            return node
        for a,b in combinations(range(len(M.M)),2):
            if a < b:
                M_rows = node.M.copy().swap_rows(a,b)
                M_cols = node.M.copy().swap_cols(a,b)
                for M2 in M_rows, M_cols:
                    if M2 not in seen:
                        seen.add(M2)
                        q.append(Node(M2, node))
                   

lines = [l.strip() for l in open('A-small-practice.in').readlines()]
N_problems = int(lines[0])
puzzles = []
i = 1
while i < len(lines):
    N = int(lines[i])
    i += 1
    puzzles.append('\n'.join(lines[i:i+2*N]))
    i += 2*N
    
for n,puzzle in enumerate(puzzles[2:10]):
    M = Matrix.from_string(puzzle)
    result = 'IMPOSSIBLE'
    if puzzle.count('1') == puzzle.count('0'):
        solution = solve(M)
        if solution:
            result = solution.depth()
    print('Case #{}: {}'.format(n,result))