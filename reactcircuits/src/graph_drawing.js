function compute_indegree(graph) {
    let indegree = {};
    let nodes = [];
    Object.keys(graph).forEach( (node) => {
        indegree[node] = 0;
    });

    Object.values(graph).forEach( (values) => {
        values.forEach( (value) => {
            if (value !== null) {
                if (!Object.keys(graph).includes(value.toString())) {
                    graph[value] = [];
                }

                if (Object.keys(indegree).includes(value.toString())) {
                    indegree[value]++;
                } else {
                    indegree[value] = 1;
                }
            }
        });
    });

    return indegree;
}

function topological_sort_helper(graph) {
    let indegree = compute_indegree(graph);
    let v = []; // visited nodes
    let q = []; // queue
    let d = {}; // depth hash

    Object.keys(indegree).forEach( (node) => {
        if (indegree[node] === 0) {
            q.push(node);
        }
    });

    while (q.length > 0) {
        let n = q.pop();
        if (!Object.keys(d).includes(n)) {
            d[n] = 0;
        }
        v.push(n.toString());
        graph[n].forEach( (c) => {
            indegree[c]--;
            if (indegree[c] === 0) {
                q.unshift(c.toString());
            }

            if (!Object.keys(d).includes(c)) {
                d[c] = 0;
            }

            d[c] = Math.max(...[d[n]+1, d[c]])

        });
    }

    let d_T = {}; //depth hash grouped by depth

    v.forEach( n => {
        let v = d[n];

        if (!Object.keys(d_T).includes(v.toString())) {
            d_T[v] = [];
        }
        d_T[v].push(n);
    });

    return {
        'sorted': v,
        'depth': d,
        'grouped_by_depth': d_T
    }
}

function graph_coordinates(graph) {
    // Khan's Algorithm for Topological Sorting
    let r = topological_sort_helper(graph);
    let d_T = r.grouped_by_depth;

// assign to layers
    let max_per_layer = 3;
    let keys = Object.keys(d_T);
    keys.sort();
    let a = [];

    keys.forEach( k => {
        let nodes = d_T[k];
        for (let i=0; i < nodes.length; i+=max_per_layer) {
            a.push(nodes.slice(i,i+max_per_layer));
        }
    });

    let coordinates = {};

    Object.keys(d_T).forEach( x => {
        x = parseInt(x);
        d_T[x].forEach( (n, y) => {
            coordinates[n] = [x, y];
        })
    });

    return coordinates;
}

export { graph_coordinates };

