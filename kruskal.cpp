#include <bits/stdc++.h>
using namespace std;

const int nMax = 1e5 + 1; // Maximum number of vertices
vector<tuple<int, int, int>> edges; // Vector to store edges as (weight, u, v)
vector<int> parent(nMax, -1), dim(nMax, 1); // DSU (Disjoint Set Union) structures for union-find operations
vector<pair<int, int>> mst; // Vector to store the edges of the Minimum Spanning Tree (MST)
int mstCost = 0; // Variable to store the total cost of the MST

int find_set(int x) {
    if (parent[x] == -1) {
        return x;
    }
    return parent[x] = find_set(parent[x]);
}

void union_sets(int x, int y) {
    x = find_set(x);
    y = find_set(y);
    if (x == y) {
        return;
    }
    if (dim[x] < dim[y]) {
        swap(x, y);
    }
    parent[y] = x;
    dim[x] += dim[y];
}

void kruskal() {
    sort(edges.begin(), edges.end()); // Sort edges by weight
    for (const auto& [w, x, y] : edges) {
        if (find_set(x) != find_set(y)) {
            union_sets(x, y);
            mst.push_back({x, y});
            mstCost += w;
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m; // Number of vertices and edges
    cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int x, y, w; // Read edge endpoints and weight
        cin >> x >> y >> w;
        edges.push_back({w, x, y});
    }
    kruskal();  // Run Kruskal's algorithm to find the MST with the global variables
    cout << "Minimum Spanning Tree cost: " << mstCost << "\n";
    cout << "Edges in the Minimum Spanning Tree:\n";
    for (const auto& [x, y] : mst) {
        cout << x << " - " << y << "\n";
    }
    
    return 0;
}