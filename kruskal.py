import sys

nMax = 100001  # Maximum number of vertices
edges = []  # Vector to store edges as (weight, u, v)
parent = [-1] * nMax  # DSU (Disjoint Set Union) structures for union-find operations
dim = [1] * nMax
mst = []  # Vector to store the edges of the Minimum Spanning Tree (MST)
mstCost = 0  # Variable to store the total cost of the MST

def find_set(x):
    if parent[x] == -1:
        return x
    parent[x] = find_set(parent[x])
    return parent[x]

def union_sets(x, y):
    x = find_set(x)
    y = find_set(y)
    if x == y:
        return
    if dim[x] < dim[y]:
        x, y = y, x
    parent[y] = x
    dim[x] += dim[y]

def kruskal():
    global mstCost
    edges.sort()  # Sort edges by weight
    for w, x, y in edges:
        if find_set(x) != find_set(y):
            union_sets(x, y)
            mst.append((x, y))
            mstCost += w

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return

    n = int(input_data[0])
    m = int(input_data[1])  # Number of vertices and edges

    idx = 2
    for _ in range(m):
        x = int(input_data[idx])
        y = int(input_data[idx + 1])
        w = int(input_data[idx + 2])  # Read edge endpoints and weight
        edges.append((w, x, y))
        idx += 3

    kruskal()  # Run Kruskal's algorithm to find the MST with the global variables

    print(f"Minimum Spanning Tree cost: {mstCost}")
    print("Edges in the Minimum Spanning Tree:")
    for x, y in mst:
        print(f"{x} - {y}")

if __name__ == "__main__":
    main()