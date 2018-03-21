import React, {Component} from 'react';
import './App.css';
import {Jumbotron} from 'react-bootstrap';
import PropTypes from 'prop-types';

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
            <line x1={props.midX} y1={props.toY} x2={props.toX} y2={props.toY} stroke={props.color}
                  strokeWidth={props.strokeWidth}/>
        </g>;
    }

    if (!props.toX && !props.toY) {
        return <g>
            <line x1={props.fromX} y1={props.fromY} x2={props.midX} y2={props.fromY} stroke={props.color}
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
            let midX = fromX + (toX - fromX) / 2.0;
            if (!toX && !toY) {
                midX = props.xspacing / 2.0 + fromX
            }
            if (!fromX && !fromY) {
                midX = -props.xspacing / 2.0 + toX
            }

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
                        <g transform={"translate(100,100)"}>
                            <Circuit xspacing={100} yspacing={80} wireDotRadius={2} wireWidth={3}>
                                <LogicGate/>
                                <Wire fromX={0} fromY={0} toX={1} toY={0.5} whichInput={0} color={'purple'}/>
                                <Wire fromX={0} fromY={1} toX={1} toY={0.5} whichInput={1} color={'blue'}/>
                                <Wire fromX={1} fromY={0.5} toX={2} toY={0} whichInput={1} color={'red'}/>
                                <Wire fromX={1} fromY={0.5} toX={2} toY={1} whichInput={0} color={'red'}/>
                                <Wire fromX={2} fromY={1} toX={3} toY={0.5} whichInput={1} color={'green'}/>
                                <Wire toX={3} toY={0.5} whichInput={0} color={'green'}/>
                                <Wire fromX={2} fromY={0} color={'black'}/>
                                <Wire fromX={3} fromY={0.5} color={'gray'}/>
                                <NORGate x={0} y={0}/>
                                <NORGate x={0} y={1}/>
                                <NORGate x={1} y={0.5}/>
                                <NORGate x={2} y={0}/>
                                <NORGate x={2} y={1}/>
                                <NORGate x={3} y={0.5}/>
                            </Circuit>
                        </g>
                    </svg>
                </div>

                <svg width={600} height={300}>
                    <defs>
                        <g id="tubes" class="tubes">
                            <g id="openlid" class="openlid">
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M115.668,83.154c-3.271,7.512-10.102,12.477-16.996,13.795c0.375,1.254,0.75,2.506,1.125,3.76
					c17.402-5.207,26.029-24.734,18.164-41.105c-1.178,0.566-2.357,1.133-3.537,1.699C118.092,67.287,119.018,75.68,115.668,83.154z"
                                    />
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M115.668,83.154c-3.271,7.512-10.102,12.477-16.996,13.795
					c0.375,1.254,0.75,2.506,1.125,3.76c17.402-5.207,26.029-24.734,18.164-41.105c-1.178,0.566-2.357,1.133-3.537,1.699
					C118.092,67.287,119.018,75.68,115.668,83.154z"/>
                                </g>
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M99.969,15.834c-1.1,0-2,0.9-2,2v37.25c0,1.1,0.9,2,2,2h0.688c1.1,0,2-0.534,2-1.188s0.9-1.188,2-1.188
					h8.938c1.1,0,2-0.9,2-2v-32.5c0-1.1-0.9-2-2-2h-8.938c-1.1,0-2-0.534-2-1.188s-0.9-1.188-2-1.188H99.969z"/>
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M99.969,15.834c-1.1,0-2,0.9-2,2v37.25c0,1.1,0.9,2,2,2h0.688
					c1.1,0,2-0.534,2-1.188s0.9-1.188,2-1.188h8.938c1.1,0,2-0.9,2-2v-32.5c0-1.1-0.9-2-2-2h-8.938c-1.1,0-2-0.534-2-1.188
					s-0.9-1.188-2-1.188H99.969z"/>
                                </g>
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M119.862,6.459c0.952-0.55,1.731-0.101,1.731,1V62.93c0,1.1-0.845,2.311-1.877,2.69l-3.121,1.148
					c-1.032,0.38-1.877-0.209-1.877-1.31V11.43c0-1.1,0.779-2.45,1.731-3L119.862,6.459z"/>
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M119.862,6.459c0.952-0.55,1.731-0.101,1.731,1V62.93
					c0,1.1-0.845,2.311-1.877,2.69l-3.121,1.148c-1.032,0.38-1.877-0.209-1.877-1.31V11.43c0-1.1,0.779-2.45,1.731-3L119.862,6.459z"
                                    />
                                </g>
                                <line class="tubeelement" fill="#F7FCFE" stroke="#000000" stroke-miterlimit="10" x1="103.656" y1="53.18" x2="103.656" y2="19.93"/>
                            </g>
                            <g id="closedlid">
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M99.102,86.172c22.801,0,22.801,18.312,0,18.312c0-1.189,0-2.38,0-3.57c13.912,0,13.912-11.173,0-11.173
					C99.102,88.551,99.102,87.361,99.102,86.172z"/>
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M99.102,86.172c22.801,0,22.801,18.312,0,18.312
					c0-1.189,0-2.38,0-3.57c13.912,0,13.912-11.173,0-11.173C99.102,88.551,99.102,87.361,99.102,86.172z"/>
                                </g>
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M53.623,107.203c0,1.1,0.9,2,2,2h37.25c1.1,0,2-0.9,2-2v-0.688c0-1.1-0.534-2-1.188-2s-1.188-0.9-1.188-2
					v-8.938c0-1.1-0.9-2-2-2h-32.5c-1.1,0-2,0.9-2,2v8.938c0,1.1-0.534,2-1.188,2s-1.188,0.9-1.188,2V107.203z"/>
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M53.623,107.203c0,1.1,0.9,2,2,2h37.25c1.1,0,2-0.9,2-2v-0.688
					c0-1.1-0.534-2-1.188-2s-1.188-0.9-1.188-2v-8.938c0-1.1-0.9-2-2-2h-32.5c-1.1,0-2,0.9-2,2v8.938c0,1.1-0.534,2-1.188,2
					s-1.188,0.9-1.188,2V107.203z"/>
                                </g>
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M44.249,87.31c-0.55-0.953-0.101-1.732,1-1.732h55.473c1.1,0,2.311,0.845,2.69,1.877l1.146,3.121
					c0.38,1.032-0.21,1.877-1.31,1.877H49.22c-1.1,0-2.45-0.779-3-1.732L44.249,87.31z"/>
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M44.249,87.31c-0.55-0.953-0.101-1.732,1-1.732h55.473
					c1.1,0,2.311,0.845,2.69,1.877l1.146,3.121c0.38,1.032-0.21,1.877-1.31,1.877H49.22c-1.1,0-2.45-0.779-3-1.732L44.249,87.31z"/>
                                </g>
                            </g>
                            <path class="tubeelement" id="tubeconnector" fill="#F7FCFE" stroke="#000000" stroke-miterlimit="10" d="M119.982,102.219
			c-7.064,0-13.705-0.357-19.486-0.986v3.924h38.973v-3.924C133.686,101.861,127.045,102.219,119.982,102.219z"/>
                            <path class="tubeelement" id="lidconnector" fill="#F7FCFE" stroke="#000000" stroke-miterlimit="10" d="M117.453,52.584
			c7.064,0,13.705,0.357,19.488,0.986v-3.924H97.969v3.924C103.75,52.941,110.391,52.584,117.453,52.584z"/>
                            <g id="tube">
                                <path class="tubeelement" fill="#F7FCFE" stroke="#000000" stroke-miterlimit="10" d="M47.999,105.156v45.309l14.998,90.066
				c0,4.35,5.036,7.875,11.249,7.875c6.215,0,11.25-3.525,11.25-7.875l15-90.066v-45.309H47.999z"/>
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M105.246,101.156c0,2.2-1.8,4-4,4h-54c-2.2,0-4-1.8-4-4v-1.875c0-2.2,1.8-4,4-4h54c2.2,0,4,1.8,4,4
					V101.156z"/>
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M105.246,101.156c0,2.2-1.8,4-4,4h-54c-2.2,0-4-1.8-4-4v-1.875
					c0-2.2,1.8-4,4-4h54c2.2,0,4,1.8,4,4V101.156z"/>
                                </g>
                                <line class="tubeelement" fill="#F7FCFE" stroke="#000000" stroke-miterlimit="10" x1="50.969" y1="129.031" x2="96.635" y2="129.031"/>
                            </g>
                            <g id="lid">
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M53.622,71.271c0,1.1,0.9,2,2,2h37.25c1.1,0,2-0.9,2-2v-0.688c0-1.1-0.534-2-1.188-2s-1.188-0.9-1.188-2
					v-8.938c0-1.1-0.9-2-2-2h-32.5c-1.1,0-2,0.9-2,2v8.938c0,1.1-0.534,2-1.188,2s-1.188,0.9-1.188,2V71.271z"/>
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M53.622,71.271c0,1.1,0.9,2,2,2h37.25c1.1,0,2-0.9,2-2v-0.688
					c0-1.1-0.534-2-1.188-2s-1.188-0.9-1.188-2v-8.938c0-1.1-0.9-2-2-2h-32.5c-1.1,0-2,0.9-2,2v8.938c0,1.1-0.534,2-1.188,2
					s-1.188,0.9-1.188,2V71.271z"/>
                                </g>
                                <g>
                                    <path class="tubeelement" fill="#F7FCFE" d="M44.247,51.378c-0.55-0.953-0.101-1.732,1-1.732h55.472c1.1,0,2.311,0.845,2.69,1.877l1.146,3.121
					c0.38,1.032-0.21,1.877-1.31,1.877H49.218c-1.1,0-2.45-0.779-3-1.732L44.247,51.378z"/>
                                    <path class="tubeelement" fill="none" stroke="#000000" stroke-miterlimit="10" d="M44.247,51.378c-0.55-0.953-0.101-1.732,1-1.732h55.472
					c1.1,0,2.311,0.845,2.69,1.877l1.146,3.121c0.38,1.032-0.21,1.877-1.31,1.877H49.218c-1.1,0-2.45-0.779-3-1.732L44.247,51.378z"
                                    />
                                </g>
                                <line class="tubeelement" fill="#F7FCFE" stroke="#000000" stroke-miterlimit="10" x1="90.969" y1="67.584" x2="57.718" y2="67.584"/>
                            </g>
                        </g>
                        <g id="mycircle" class="hobnob">
                            <g><g class="jack" id="somethiglj"><circle class="ele" cx="0" cy="0" r="50" /></g></g></g>
                        <g id="closedtube" class="highlight">
                            <use xlinkHref="#closedlid" />
                            <use xlinkHref="#tube" />
                        </g>
                        <g id="opentube">
                            <use xlinkHref="#openlid" />
                            <use xlinkHref="#tube" />
                        </g>
                        <g id="tubewithlid" class="tube">
                            <use xlinkHref="#lid" />
                            <use xlinkHref="#tube" />
                        </g>
                    </defs>
                    <style>{stl}</style>
                    <text id="heading" font-size="24px" x="-0" y="50">
                        SVG demonstration</text>
                    <use id="myothercircle" xlinkHref="#mycircle"/>
                    <g id="activetubes">
                        <use id="tube1" transform="translate(0,20)" xlinkHref="#tubeconnector"/>
                        <use transform="translate(75,20)" xlinkHref="#tubeconnector"/>
                        <use transform="translate(150,20)" xlinkHref="#tubeconnector"/>
                        <use transform="translate(0,0)" xlinkHref="#closedtube"/>
                        <use transform="translate(75,0)" xlinkHref="#opentube"/>
                        <use transform="translate(150,0)" xlinkHref="#closedtube"/>
                        <use transform="translate(225,0)" xlinkHref="#closedtube"/>
                    </g>
                </svg>
            </div>
        );
    }
}

export default App;
