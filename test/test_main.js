import { calcGraphCoordinates, totalAdjIntersections, invertAdjList, untangleGraph, findNumIntersections, topoSortHelper } from "../src/utilities/graph_drawing.js"
import { Vector, hasIntersection, } from "../src/utilities/hasIntersection.js"
import {gatesToAdjList} from "../src/utilities/gates_to_adjacency_list";
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
let sortBy = require('lodash/sortBy');
let mean = require('lodash/mean');
let range = require('lodash/range');
let flatten = require('lodash/flatten');

describe('graph_drawing', function() {

    describe('#gates', () => {
        it('should compute adj list', () => {
            let nor_gates = [
                [0, 0, 1],
                [0, 0, 2],
                [1, 2, 3],
                [1, 2, 4]
            ];

            let _adj = gatesToAdjList(nor_gates);

            let expected_adj_list = {
                0: [2, 3],
                1: [2, 3],
                2: [],
                3: []
            };

            expect(_adj.adjacency_list).deep.to.equal(expected_adj_list);
            console.log(_adj.wire_hash);
        });

        it('should only have node indices 0 through 4', () => {
            let expected_adj_list = {
                0: [4],
                1: [2, 3],
                2: [4],
                3: [4],
                4: []
            };
            let gates = [

                [10, 10, 6],
                [0, 1, 2],
                [3, 2, 5],
                [2, 4, 6],
                [5, 6, 7],
            ];
            // let nor_gates = [
            //     [0, 0, 1],
            //     [0, 0, 3],
            //     [1, 0, 2],
            //     [2, 0, 5],
            //     [0, 0, 2],
            //     [3, 0, 2]
            // ];


            let _adj = gatesToAdjList(gates);
            let graph = _adj.adjacency_list;
            expect(graph).deep.to.equal(expected_adj_list);
        });

    });

    describe('#graph_topology', () => {

        let graph = {};

        beforeEach( () => {
            graph = {
                5: [1, 2],
                1: [0],
                2: [0],
                4: [],
                6: [5]
            };
        });

        describe('#reverse_adjacency_list', () => {
            it('should reverse adjacency list', () => {
                let inverted_graph = invertAdjList(graph);
                let expected_graph = {
                    0: [1,2],
                    1: [5],
                    2: [5],
                    4: [],
                    5: [6],
                    6: [],
                };
                expect(inverted_graph).deep.to.equal(expected_graph);
            });

            it('should reverse adjacency list of other graph', () => {
                graph = {
                    0: [2],
                    1: [5],
                    2: [3],
                    3: [],
                    4: [3],
                    5: [3],
                    6: []
                };
                let inverted_graph = invertAdjList(graph);
                let expected_graph = {
                    0: [],
                    1: [],
                    2: [0],
                    3: [2, 4, 5],
                    4: [],
                    5: [1],
                    6: [],
                };
                expect(inverted_graph).to.deep.equal(expected_graph);
            });
        });

        it('should not modify the graph', () => {
            let expected_adj_list = {
                0: [4],
                1: [2, 3],
                2: [4],
                3: [4],
                4: []
            };
            let adj_list = {};
            Object.assign(adj_list, expected_adj_list);
            topoSortHelper(expected_adj_list);
            expect(adj_list).deep.to.equal(expected_adj_list)
        });

        describe('#sort_forward_shifted', () => {
            let adj = {};
            beforeEach( () => { adj = topoSortHelper(graph)});


            it('should find depth', () => {
                let expected_depth_hash = {'0': 3, '1': 2, '2': 2, '5': 1, '6': 0, '4': 0,};
                expect(adj.depth).to.deep.equal(expected_depth_hash);
                console.log(adj);
            });

            it('should find topology based on parents', () => {
                let expected_visited_nodes = [4, 6, 5, 1, 2, 0].map( x => x.toString() );
                expect(adj.sorted).to.deep.equal(expected_visited_nodes)
            });

            it('should find depth hash', () => {
                let expected_depth_hash =    { '0': [ '4', '6' ],
                    '1': [ '5' ],
                    '2': [ '1', '2' ],
                    '3': [ '0' ] };
                expect(adj.grouped_by_depth).to.deep.equal(expected_depth_hash);
            })
        });

        describe('#graph_coordinates', () => {
           it('should find coordinates', () => {
               let c = calcGraphCoordinates(graph).coordinate_hash;
               let xpos = {};
               Object.keys(c).forEach( (n) => {
                    xpos[n] = c[n][0]
               });
               let expected_xpos = {
                   '4': 0,
                   '6': 0,
                   '5': 1,
                   '1': 2,
                   '2': 2,
                   '0': 3
               };
               expect(xpos).deep.to.equal(expected_xpos);
           });
        });
    });

    describe('#intersection', function() {

        it('should find intersections', () => {
            let p1, q1, p2, q2;

            p1 = Vector(1, 1);
            q1 = Vector(5, 2);
            p2 = Vector(2, 0);
            q2 = Vector(4, 5);

            assert.equal(hasIntersection(p1, q1, p2, q2), true);
            assert.equal(hasIntersection(p1, q1, p2, q2), true);
            assert.equal(hasIntersection(q1, p1, p2, q2), true);
            assert.equal(hasIntersection(p1, q1, q2, p2), true);
            assert.equal(hasIntersection(p2, q2, q1, p1), true);

            assert.equal(hasIntersection(p1, q1, Vector(1,5), Vector(3,2)), false);

            assert.equal(hasIntersection(Vector(0,0), Vector(1,1), Vector(1.1, 1.1), Vector(2, 2)), false);

            assert.equal(hasIntersection(Vector(0,0), Vector(1.11,1.11), Vector(1.1, 1.1), Vector(2, 2)), true);
        })
    });

    describe("#find_intersections", () => {
        let graph, coordinate_hash;

        beforeEach( () => {
            graph = {
                0: [3],
                1: [2],
                4: [5],
                6: [7],
                8: [9]
            };
            coordinate_hash = {
                0: [0, 1],
                1: [0, 0],
                2: [1, 1],
                3: [1, 0],
                4: [0, 2],
                5: [1, 2],
                6: [0, 2],
                7: [2, -1],
                8: [0.5, 4],
                9: [0.5, 2]
            };
        });

        it('should find no intersections', () => {
            let num_intersection = findNumIntersections([0], graph, coordinate_hash);
            assert.equal(num_intersection, 0);
        });

        it('should find 1 intersection', () => {
            let num_intersection = findNumIntersections([4, 8], graph, coordinate_hash);
            assert.equal(num_intersection, 1);
        });

        it('should find 1 intersection', () => {
            let num_intersection = findNumIntersections([0, 1], graph, coordinate_hash);
            assert.equal(num_intersection, 1);
        });

        it('should find 1 intersection with non-intersecting segment', () => {
            let num_intersection = findNumIntersections([0, 1, 4], graph, coordinate_hash);
            assert.equal(num_intersection, 1);
        });

        it('should find 1 intersection with segments "45 and 67', () => {
            let num_intersection = findNumIntersections([4, 6], graph, coordinate_hash);
        });

        it('should find just 2 intersections 03+12, 67+12', () => {
            let num_intersection = findNumIntersections([0, 1, 6], graph, coordinate_hash);
            assert.equal(num_intersection, 2);
        });

        it('should find all 3 intersections using all nodes', () => {
            let num_intersection = findNumIntersections([0, 1, 4, 6], graph, coordinate_hash);
            assert.equal(num_intersection, 3);
        });
    });

    describe("#vertical_sort", () => {
        let graph, coordinate_hash;

        beforeEach( () => {
                graph = {
                    0: [3],
                    3: [4],
                    1: [2],
                    2: [5],
                    4: [],
                    5: []
                };
                coordinate_hash = {
                    0: [0, 1],
                    1: [0, 0],
                    2: [1, 1],
                    3: [1, 0],
                    4: [2, 1],
                    5: [2, 0]
                };
            });

        it("should 'untangle' the graph resulting in no intersections", () => {
            let layers = [[0,1], [2,3], [4,5]];
            assert(totalAdjIntersections(layers, graph, coordinate_hash) === 2);
            untangleGraph(layers, graph, coordinate_hash);
            let expected_coordinate_hash = {
                0: [0, 1],
                1: [0, 0],
                2: [1, 0],
                3: [1, 1],
                4: [2, 1],
                5: [2, 0]
            };
            expect(coordinate_hash).deep.to.equal(expected_coordinate_hash);
            assert(totalAdjIntersections(layers, graph, coordinate_hash) === 0)
        })
    })

});