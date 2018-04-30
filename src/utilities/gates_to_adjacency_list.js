function gatesToAdjList(gates) {
    // let gates = [
    //     [0, 0, 1],
    //     [0, 0, 1],
    //     [1, 0, 2],
    //     [0, 2, 0],
    // ];

    function flatten(arr) {
        return arr.reduce(function (flat, toFlatten) {
            return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
        }, []);
    }

    let wires, adjacency_list, wire_hash;
    adjacency_list = {};
    wire_hash = {};
    gates.forEach( (gate, i) => {
        adjacency_list[i] = []
    });
    wires = gates.slice(0);
    wires = flatten(wires);
    wires = [...new Set(wires)];
    wires.forEach( w => {
        wire_hash[w] = {'to': [], 'from': []}
    });

    gates.forEach( (gate1, i1) => {
        let output_wire = gate1[2];
        let wire_from = wire_hash[output_wire].from;
        if (!wire_from.includes(i1)) {
            wire_from.push(i1);
        }
        gates.forEach( (gate2, i2) => {
            gate2.slice(0,-1).forEach( input_wire => {
                if (output_wire === input_wire) {
                    adjacency_list[i1].push(i2);
                }
                let wire_to = wire_hash[input_wire].to;
                if (!wire_to.includes(i2)) {
                    wire_to.push(i2);
                }
            });
        })
    });

    return {
        'adjacency_list': adjacency_list,
        'wires': wires,
        'wire_hash': wire_hash
    }
}

export { gatesToAdjList }
