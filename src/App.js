import React, {Component} from 'react';
import './App.css';
import {calcGraphCoordinates} from './utilities/graph_drawing.js'
import {gatesToAdjList} from "./utilities/gates_to_adjacency_list.js";
import {Jumbotron} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {invertAdjList, topoSortHelper, untangleGraph} from "./utilities/graph_drawing";
import {hasIntersection} from "./utilities/hasIntersection";

let randomColor = require('randomcolor');
let mean = require('lodash/mean');
let filter = require('lodash/filter');
let range = require('lodash/range');

function NORGate(props) {
    return <g transform={"translate(" + props.x + "," + props.y + ")"}>
        <g>
            <path fill="#FFFFFF" d="M61.667,28.347c0.018-14.897-21.65-26.999-48.396-27.031C9.542,1.31,5.911,1.542,2.421,1.982
		c4.742,6.605,7.7,15.944,7.688,26.303c-0.014,10.359-2.992,19.689-7.749,26.287c3.486,0.447,7.116,0.688,10.847,0.692
		C39.951,55.297,61.65,43.246,61.667,28.347z"/>
            <path d="M13.204,56.58c-3.712-0.006-7.416-0.242-11.014-0.705L0,55.594l1.292-1.791c4.826-6.693,7.49-15.756,7.502-25.519
		C8.806,18.521,6.163,9.451,1.354,2.75L0.067,0.955l2.188-0.276C5.854,0.222,9.56-0.005,13.272,0
		c13.156,0.018,25.542,2.895,34.875,8.109c9.574,5.349,14.844,12.535,14.834,20.239c-0.01,7.703-5.295,14.881-14.883,20.206
		C38.751,53.745,26.36,56.595,13.204,56.58z M4.659,53.511c2.811,0.289,5.678,0.436,8.549,0.438
		c25.979,0.031,47.127-11.453,47.145-25.604C60.369,14.196,39.248,2.661,13.27,2.63c-2.872-0.003-5.737,0.137-8.55,0.417
		c4.348,6.916,6.715,15.786,6.703,25.24C11.412,37.742,9.022,46.604,4.659,53.511z"/>
        </g>
        <g>
            <circle fill="#FFFFFF" cx="65.874" cy="29.302" r="4.407"/>
            <path d="M65.867,34.759c-3.01-0.004-5.455-2.454-5.451-5.465s2.455-5.455,5.465-5.451c3.01,0.003,5.455,2.454,5.453,5.465
		C71.33,32.318,68.876,34.762,65.867,34.759z M65.878,25.947c-1.85-0.004-3.357,1.501-3.359,3.35
		c-0.002,1.851,1.502,3.357,3.352,3.36c1.85,0.002,3.355-1.501,3.359-3.352C69.232,27.457,67.728,25.949,65.878,25.947z"/>
        </g>
    </g>

}

NORGate.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
};

function Wire(props) {
    if (!props.fromX && !props.fromY) {
        return <g>
            <line x1={props.midX - (props.midX - props.toX) * 0.1} y1={props.toY} x2={props.toX} y2={props.toY} stroke={props.color}
                  strokeWidth={props.strokeWidth}/>
        </g>;
    }

    if (!props.toX && !props.toY) {
        return <g>
            <line x1={props.fromX} y1={props.fromY} x2={props.midX + (props.fromX - props.midX) * 0.1} y2={props.fromY} stroke={props.color}
                  strokeWidth={props.strokeWidth}/>
        </g>;
    }

    return <g>
        <line x1={props.fromX} x2={props.midX} y1={props.fromY} y2={props.fromY} stroke={props.color}
              strokeWidth={props.strokeWidth}></line>
        <line x1={props.midX} x2={props.toX} y1={props.toY} y2={props.toY} stroke={props.color}
              strokeWidth={props.strokeWidth}></line>
        <line x1={props.midX} x2={props.midX} y1={props.fromY} y2={props.toY} stroke={props.color}
              strokeWidth={props.strokeWidth}></line>
        <circle cx={props.midX} cy={props.toY} r={props.dotRadius} fill={props.color}/>
        <circle cx={props.midX} cy={props.fromY} r={props.dotRadius} fill={props.color}/>
    </g>
}

Wire.propTypes = {
    toX: PropTypes.number.isRequired,
    toY: PropTypes.number.isRequired,
    midX: PropTypes.number,
    fromX: PropTypes.number.isRequired,
    fromY: PropTypes.number.isRequired,
    whichInput: PropTypes.number.isRequired,
};

function Circuit(props) {
    let yoffsetopt = 12;

    let cx = 30;
    let cy = 30;
    let midXOffset = 7;

    function circuitMapping(child) {
        if (child.type === NORGate) {
            return React.cloneElement(child, {
                x: props.xspacing * child.props.x,
                y: props.yspacing * child.props.y,
            })
        }
        else if (child.type === Wire) {
            let yoffset = (child.props.whichInput === 0) ? -yoffsetopt : yoffsetopt;
            let relOffset = 0;

            let toX = props.xspacing * child.props.toX + cx;
            let toY = props.yspacing * child.props.toY + cy + yoffset;
            let fromX = props.xspacing * child.props.fromX + cx;
            let fromY = props.yspacing * child.props.fromY + cy;
            // let midX = child.props.midX;
            let midX = toX - props.xspacing/2.0;
            // let midX = fromX + (toX - fromX) / 2.0;
            if (!toX && !toY) {
                midX = props.xspacing / 2.0 + fromX
            }
            if (!fromX && !fromY) {
                midX = -props.xspacing / 2.0 + toX
            }

            // if ( typeof fromX !== 'undefined') {
            //     midX += 3;
            // }

            return React.cloneElement(child,
                {
                    toX: toX,
                    toY: toY,
                    fromX: fromX,
                    fromY: fromY,
                    midX: midX + midXOffset,
                    dotRadius: props.wireDotRadius,
                    color: child.props.color,
                    strokeWidth: props.wireWidth,
                })
        }
        else if (child.type === LogicGate) {
            return React.Children.map(child.children, grandchild => {
                return circuitMapping(grandchild);
            })
        }
    }

    let children = React.Children.map(props.children, child => {
        return circuitMapping(child)
    });

    return <g>{children}</g>
}

Circuit.propTypes = {
    yspacing: PropTypes.number.isRequired,
    xspacing: PropTypes.number.isRequired,
    wireDotRadius: PropTypes.number.isRequired,
    wireWidth: PropTypes.number.isRequired,
};

function LogicGate(props) {
    let x = 1;
    let y = 1;
    let input1 = [0, 0, 'blue'];
    let input2 = [null, null, 'green'];
    let output = null;

    let wires = [
        <Wire toX={x} toY={y} fromX={input1[0]} fromY={input1[1]} color={input1[2]} whichInput={0}/>,
        <Wire toX={x} toY={y} fromX={input2[0]} fromY={input2[1]} color={input2[2]} whichInput={1}/>
    ];

    if (output) {
        wires.append(<Wire fromX={x} fromY={y} color={output}/>);
    }

    return <g>
        {wires}
        <NORGate x={x} y={x}/>
    </g>
}

class App extends Component {
    render() {

        let width = 500;
        let height = 500;
        let stl = `/* <![CDATA[ */
                        .ele {
                            fill: blue;
                            }
                        /* ]]> */`;

        // let nor_gates = [
        //
        //     [10, 10, 6],
        //     [0, 1, 2],
        //     [3, 2, 5],
        //     [2, 4, 6],
        //     [5, 6, 7],
        // ];
        // let nor_gates = [
        //     [0, 0, 1],
        //     [0, 0, 3],
        //     [1, 0, 2],
        //     [2, 0, 5],
        //     [0, 0, 2],
        //     [3, 0, 2]
        // ];
        let nor_gates = [
            [0, 0, 4],
            [1, 0, 3],
            [3, 4, 5],
            [0, 0, 1],
            [0, 0, 1],
            [2, 0, 4],
            [0, 0, 2],
        ];


        let _adj = gatesToAdjList(nor_gates);
        let graph = _adj.adjacency_list;

        let wire_list = _adj.wires;
        let wire_hash = _adj.wire_hash;
        let wire_colors = {};
        wire_list.forEach( (wire) => {
            wire_colors[wire] = randomColor();
        });
        let _c = calcGraphCoordinates(graph, 4);
        let coor = _c.coordinate_hash;
        let layers = _c.layers;



        // add phony nodes to graph

        let graph_copy = Object.assign({}, graph);

        // TODO: correct adding extra nodes
        let temporary_nodes = {};
        let _topo = topoSortHelper(graph);
        let temp_node_i = _topo.sorted.length;
        _topo.sorted.forEach( (parent) => {
            let c0 = coor[parent][0];
            let children = graph[parent];
            children.forEach( child => {
                let c1 = coor[child][0];
                console.log(parent);
                console.log(range(c0+1, c1));
                range(c0+1, c1).forEach( column => {
                    console.log("temp node " + temp_node_i);
                    temporary_nodes[temp_node_i-1] = [temp_node_i];
                    coor[temp_node_i] = [column, 0];
                    temp_node_i += 1
                })
            })
        });
        console.log(graph_copy);
        Object.assign(graph, temporary_nodes);
        console.log(graph);
        _topo = topoSortHelper(graph);

        // move to mid point of neighbors
        let graph_T = invertAdjList(graph);
        let placed = [];
        _topo.sorted.forEach( (child, i) => {
            let parents = graph_T[child.toString()];

            let column = coor[child][0];
            console.log("Column: " + column);
            let placed_in_col = placed[column];
            if (typeof placed_in_col == 'undefined') {
                placed[column] = [];
                placed_in_col = placed[column];
            }
            console.log(child);
            console.log(graph_T);
            console.log(parents);

            // let sister_gates = filter(coor, (o, k) => { return coor[child][0] == o[0] && child !== k});
            if (parents.length === 0 || typeof parents == 'undefined') {

            } else {
                let xs = parents.map( p => { return coor[p.toString()][1] });
                let x = Math.floor(mean(xs));
                // x = mean(xs);
                console.log(placed_in_col);
                if (placed_in_col.includes(x)) {
                    x = Math.max(placed_in_col) + 1;
                }
                coor[child][1] = x;
                placed_in_col.push(x);
                console.log('pushing ' + x);
                console.log(placed);
            }
        });

        untangleGraph(layers, graph, coor);

        // restore original graph
        graph = graph_copy;

        let wires = [];
        let gates = [];
        Object.keys(graph).forEach( (gate_num) => {
            let _xy, x, y, gate;

            gate = nor_gates[gate_num];
            _xy = coor[gate_num];
            x = _xy[0];
            y = _xy[1];
            gates.push(
                <NORGate x={x} y={y} />
            );

            let output_wire_num = gate[gate.length-1];
            let output_wire_color = wire_colors[output_wire_num];

            graph[gate_num].map( (c) => {
                if (c !== null) {
                    let _toxy, toX, toY;
                    let child_gate = nor_gates[c];
                    _toxy = coor[c];
                    toX = _toxy[0];
                    toY = _toxy[1];
                    let whichInput = child_gate.slice(0,-1).indexOf(output_wire_num);
                    while (whichInput !== -1) {
                        wires.push(
                            <Wire fromX={x} fromY={y} toX={toX} toY={toY} whichInput={whichInput} color={output_wire_color}/>
                        );
                        whichInput = child_gate.slice(0,-1).indexOf(output_wire_num, whichInput+1);
                    }
                }
            });

            // if nor gate has no dependents...
            let _arr = graph[gate_num].filter(function(n){ return n != null });
            if (_arr.length === 0) {
                wires.push(
                    <Wire fromX={x} fromY={y} color={wire_colors[nor_gates[gate_num][2]]}/>
                )
            }

            // if nor gate has no parents...
            let i1 = nor_gates[gate_num][0];
            let i2 = nor_gates[gate_num][1];
            [i1, i2].forEach( (i, whichInput) => {
                if (wire_hash[i].from.length === 0) {
                    wires.push(
                        <Wire toX={x} toY={y} whichInput={whichInput} color={wire_colors[i]} />
                )
                }
            });
        });

        return (
            <div className="App">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
                      integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
                      crossorigin="anonymous"/>

                <Jumbotron>
                    <h1>ReactCircuit</h1>
                    <p>
                        automatic circuit SVG creation (beta)
                    </p>
                </Jumbotron>

                <div>
                    <p>Here goes the circuits...</p>
                    <svg
                        width={width}
                        height={height}
                        viewBox={"0 0 " + width + " " + height}
                    >
                        <rect x={0} y={0} width={width} height={width} stroke={'black'} strokeWidth={3.0}
                              fill={"none"}/>
                        {/*<line x1={25} y1={30} x2={100} y2={30} stroke={'black'} strokeWidth={4} />*/}
                        <g transform={"translate(25,25)"}>
                            <Circuit xspacing={100} yspacing={80} wireDotRadius={2} wireWidth={5}>
                                {wires}
                                {gates}
                            </Circuit>
                        </g>
                    </svg>
                </div>
            </div>
        );
    }
}

export default App;
