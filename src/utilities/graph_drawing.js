import {hasIntersection, Vector} from "./hasIntersection";
import {forEach} from "lodash/collection.js";

// let sortBy = require('lodash/sortBy');
let flatten = require('lodash/flatten');
let range = require('lodash/range');
let differenceBy = require('lodash/differenceBy');

/**
 * Computes the indegree for each node in an adjacency list
 *
 * @param adj_list - adjacency list
 * @returns {{}}
 */
function compute_indegree(adj_list) {
    let indegree = {};
    let nodes = [];
    Object.keys(adj_list).forEach((node) => {
        indegree[node] = 0;
    });

    Object.values(adj_list).forEach((values) => {
        values.forEach((value) => {
            if (value !== null) {
                if (!Object.keys(adj_list).includes(value.toString())) {
                    adj_list[value] = [];
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

/**
 * Inverts an adjacency list
 *
 * @param adj_list
 * @returns {{}}
 */
function invertAdjList(adj_list) {
    let indegree = compute_indegree(adj_list);
    let adj_T = {};
    Object.keys(indegree).forEach(n => {
        adj_T[n] = [];
    });
    forEach(indegree, (_, parent) => {
        let children = adj_list[parent];
        if (typeof children != 'undefined') {
            children.forEach(child => {
                let parents = adj_T[child];
                if (typeof parents == 'undefined') {
                    parents = [];
                    adj_T[child] = parents;
                }
                if (!parents.includes(parent)) {
                    parents.push(parseInt(parent));
                }
            })
        }

    });
    return adj_T;
}

/**
 * Topologically sorts a graph
 *
 * @param graph
 * @returns {{sorted: Array, depth: {}, grouped_by_depth: {}}}
 */
function topoSortHelper(graph) {

    // Coffman–Graham algorithm

    // 1. cleanup graph so that only direct dependencies are represented (transitive reduction)
    // 2. topological sorting
    // 3.
    let _graph = graph;

    if (Object.keys(graph).includes(null)) {
        delete graph[null];
    }
    let indegree = compute_indegree(graph);
    let visited_nodes = []; // visited nodes
    let node_queue = []; // queue
    let depth_hash = {}; // depth hash

    let node_list = Object.keys(indegree).sort((a, b) => a - b);  // sort by node number
    node_list.forEach((node) => {
        if (indegree[node] === 0) {
            node_queue.unshift(node);
        }
    });

    let vx = [];
    let layer;
    while (node_queue.length > 0) {
        let n = node_queue.pop();
        if (!Object.keys(depth_hash).includes(n)) {
            depth_hash[n] = 0;
        }
        visited_nodes.push(n.toString());
        graph[n].forEach((c) => {
            indegree[c]--;
            if (indegree[c] === 0) {
                node_queue.unshift(c.toString());
            }

            if (!Object.keys(depth_hash).includes(c)) {
                depth_hash[c] = 0;
            }
            depth_hash[c] = Math.max(...[depth_hash[n] + 1, depth_hash[c]])
        });
    }

    // create depth hash
    let groupedByDepth = {}; //depth hash grouped by depth
    visited_nodes.forEach(n => {
        let depth = depth_hash[n];
        let nodesAtDepth = groupedByDepth[depth];
        if (typeof nodesAtDepth == 'undefined') {
            nodesAtDepth = [];
            groupedByDepth[depth] = nodesAtDepth;
        }
        nodesAtDepth.push(n);
    });

    return {
        'sorted': visited_nodes,
        'depth': depth_hash,
        'grouped_by_depth': groupedByDepth
    }
}

function assignToLayer(graph, max_per_layer = 4) {
// Khan's Algorithm for Topological Sorting
    let r = topoSortHelper(graph);
    let d_T = r.grouped_by_depth;
    let max_depth = Math.max(...Object.keys(d_T).map(x => parseInt(x)));

    // assign to layers
    let keys = Object.keys(d_T);
    keys.sort();
    let a = [];

    keys.forEach(k => {
        let nodes = d_T[k];
        for (let i = 0; i < nodes.length; i += max_per_layer) {
            a.push(nodes.slice(i, i + max_per_layer));
        }
    });

    let coordinates = {};

    a.forEach((layer, depth) => {
        layer.forEach((node, y) => {
            coordinates[node] = [depth, y];
        })
    });

    // sort x coordinates using a 'bubble-sort'


    return {coordinate_hash: coordinates, layers: a};
}

function getSegments(nodes, graph, coordinate_hash) {
    // collect segments from graph for the selected nodes
    // while a segment is a pair of vectors (v1.x, v1.y, v2.x, v2.y)
    let segments = [];
    nodes.forEach(node => {
        let children = graph[node];
        let p1 = Vector(...coordinate_hash[node]);
        children.forEach(child => {
            let q1 = Vector(...coordinate_hash[child]);
            segments.push([p1, q1]);
        })
    });
    return segments
}

function getUnorderedPairs(arr) {
    // find all non-ordered combinations of segments
    let arr_copy = arr.slice(0);
    let pairs = [];
    while (arr_copy.length > 0) {
        let a1 = arr_copy.pop();

        arr_copy.forEach(a2 => {
            pairs.push([a1, a2]);
        });
    }
    return pairs
}

function segmentLength(p, q) {
    return ((q.x - p.x) ** 2 + (q.y - p.y) ** 2)**0.5
}

/**
 *
 * @param nodes
 * @param graph
 * @param coordinate_hash
 * @returns {number}
 */
function findNumIntersections(nodes, graph, coordinate_hash) {
    let num_intersections = 0;

    // collect segments from graph for the selected nodes
    // while a segment is a pair of vectors (v1.x, v1.y, v2.x, v2.y)
    let segment_pairs = getUnorderedPairs(getSegments(nodes, graph, coordinate_hash));

    segment_pairs.forEach((s, i) => {
            let s1, s2;
            [s1, s2] = [...s];
            if (hasIntersection(...s1, ...s2)) {
                // console.log(" >>> intersects");
                // console.log(s1);
                // console.log(s2);
                num_intersections++;
            }
        }
    );

    return num_intersections;
}

function totalAdjIntersections(layers, graph, coordinate_hash) {
    let t = 0;
    layers.forEach( layer => {
        t += findNumIntersections(layer, graph, coordinate_hash);
    });
    return t;
}

/**
 * Sorts vertical columns of a layered graph to sub-optimally minimize
 * the number of edge interactions/crossings. Permutes the coordinates of each
 * layer as long as the number of crossings is reduced.
 *
 * @param layers
 * @param graph
 * @param coordinate_hash
 */
function untangleGraph(layers, graph, coordinate_hash) {
    // let layers = [[0,1], [2,3], [4,5]];

    // create dummny nodes
    let width = 5;
    layers.forEach( (layer, c) => {
        let y_coordinates = layer.map( n => {return coordinate_hash[n][1] });
        let empty_spaces = differenceBy(range(0, 4), y_coordinates, Math.floor);
        let i = -1;
        empty_spaces.forEach( y => {
            layer.push(i.toString());
            coordinate_hash[i] = [c, y];
            graph[i] = [];
             i--;
        });
    });

    let num_intersections = totalAdjIntersections(layers, graph, coordinate_hash);
    let prev_intersections = 100;
    let max_iteractions = 20;
    let iteration = 0;
    // while number of intersections is improving, continue sorting
    while (iteration < max_iteractions && num_intersections < prev_intersections) {
        console.log("Iteration: " + iteration);
        prev_intersections = num_intersections;
        console.log("Prev: " + prev_intersections);
        console.log(layers);
        layers.slice(0, -1).forEach((parent_layer, layer_num) => {
            console.log("Layer: " + layer_num);
            let layer = layers[layer_num + 1];
            if (layer_num == 0) {
                layer = parent_layer
            }
            // console.log("Layer " + layer);
            let layer_copy = layer.slice(0);
            // console.log(" num intersections for layer: " + findNumIntersections(layer, graph, coordinate_hash));

            while (layer_copy.length > 0) {
                // search for uv pairs
                let u = layer_copy.pop();
                layer_copy.forEach(v => {


                    let cc = Object.assign({}, coordinate_hash);
                    let num_uv, num_vu;

                    let segments_uv = getSegments(layer, graph, coordinate_hash);
                    let segments_vu = getSegments(layer, graph, cc);
                    let dis_uv = segments_uv.reduce( (sum, x) => { return sum+segmentLength(...x) }, 0);
                    let dis_vu = segments_vu.reduce( (sum, x) => { return sum+segmentLength(...x) }, 0);

                    cc[u] = coordinate_hash[v];
                    cc[v] = coordinate_hash[u];

                    // num_uv = findNumIntersections(parent_layer, graph, coordinate_hash);
                    // num_vu = findNumIntersections(parent_layer, graph, cc);

                    num_uv = totalAdjIntersections(layers, graph, coordinate_hash);
                    num_vu = totalAdjIntersections(layers, graph, cc);

                    let w_uv = num_uv + 0.001 * dis_uv;
                    let w_vu = num_vu + 0.001 * dis_vu;

                    console.log("nodes: " + u + ", " + v);
                    console.log("weights: " + w_uv + " " + w_vu);
                    console.log(coordinate_hash[u] + " "+ coordinate_hash[v]);

                    // swap coordinates uv with vu if it would result in less intersections
                    if (w_vu < w_uv) {

                        console.log("swapping " + u + " and " + v);
                        Object.assign(coordinate_hash, cc);
                    }
                })
            }
            // console.log(" num intersections: " + findNumIntersections(layer, graph, coordinate_hash));
        });
        num_intersections = totalAdjIntersections(layers, graph, coordinate_hash);
        console.log("New: " + num_intersections);
        iteration++;
    }
}

/**
 * Determines the optimal coordinates for displaying circuits
 *
 * @param graph
 * @returns {{}}
 */
function calcGraphCoordinates(graph, max_per_layer = 4) {
    return assignToLayer(graph, max_per_layer);

}

export {calcGraphCoordinates, totalAdjIntersections, invertAdjList, topoSortHelper, assignToLayer, findNumIntersections, untangleGraph};