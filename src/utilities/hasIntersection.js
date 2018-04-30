import {Vector} from './vector.js'

var inRange = require('lodash/inRange');

/**
 * Checks to see if point q is on segment 'pr'
 * @param p
 * @param q
 * @param r
 * @returns {boolean}
 */
function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
        return true;

    return false;
}

/**
 * Checks if segments 'p1q1' and 'p2q2' intersect
 * @param p1
 * @param q1
 * @param p2
 * @param q2
 * @returns {boolean}
 */
function hasIntersection(p1, q1, p2, q2) {
    if (q1.x < p1.x) {
        [q1, p1] = [p1, q1];
    }
    if (q2.x < p2.x) {
        [q2, p2] = [p2, q2];
    }
    if (p2.y < p1.y) {
        [p1, q1, p2, q2] = [p2, q2, p1, q1];
    }

    function slope(p, q) {
        return (q.y - p.y) / (q.x - p.x);
    }

    if (onSegment(p1, p2, q1)) {
        return true;
    }

    let xbound1, xbound2;
    xbound1 = Math.max(p1.x, p2.x);
    xbound2 = Math.min(q1.x, q2.x);
    let c2 = p2.y - p1.y;
    let m1 = slope(p1, q1);
    let m2 = slope(p2, q2);
    let x = c2 / (m1 - m2);
    return inRange(x + xbound1, xbound1, xbound2 + 0.01);
}

function combinations(str) {
    var fn = function(active, rest, a) {
        if (!active && !rest)
            return;
        if (!rest) {
            a.push(active);
        } else {
            fn(active + rest[0], rest.slice(1), a);
            fn(active, rest.slice(1), a);
        }
        return a;
    }
    return fn("", str, []);
}

export { Vector, hasIntersection}