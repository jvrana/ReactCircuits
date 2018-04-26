import { graph_coordinates } from "../src/graph_drawing.js"
var chai = require('chai');
var assert = chai.assert;

describe('utils', function() {
    describe('#cartesian2polar', function() {

        it('should equal', function () {
            let graph = {
                5: [1,2],
                1: [0],
                2: [0],
                4: [],
                6: [5]
            };
            console.log(graph_coordinates);
            let c = graph_coordinates(graph);
            console.log(c);

            // Coffman–Graham algorithm

            // 1. cleanup graph so that only direct dependencies are represented (transitive reduction)
            // 2. topological sorting
            // 3.

        });

        // it('should equal [-100, 0] when pos=1250', function() {
        //     let xy = position2cartesian(1250, 1000, 100);
        //     let x = Math.round(xy[0] * 10000) / 10000;
        //     let y = Math.round(xy[1] * 10000) / 10000;
        //     assert.equal(x, 100);
        //     assert.equal(y, 0);
        // });

    });
});