const prompts = require('./prompts.json');
const utils = require('./utils.js');
const welcome_flow = require('./data/welcome.json');
const detect_problem = require('./detect_problem.js')
const depression_flow = require('./data/depression.json');
const db = require('./db');

let user_states = {}
let code_handlers={
    detect_problem: detect_problem
}

let flow_mapping={
    welcome: welcome_flow,
    depression: depression_flow
}


exports.handleMessage = async (user, query, intent, parameters) => {
    await db.writeToHistory(user.uuid, '>', '', query)
    return db.getState(user.uuid).then(async user_state_obj => {
        console.log("===================>", query)
        let res= await detect_problem.callDF(query)
        console.log(res)
        if(res){
            return res
        }
        if (query === "reset") {
            user_state_obj = undefined;
        }

        console.log(utils);
        

        if (utils.isEmpty(user_state_obj)) {
            console.log(user_state_obj);
            console.log("entered here")
            user_states[user.uuid] = welcome_flow.node1.prompt
            return db.setState(user.uuid, "welcome.node1").then(async user_state => {
                await db.writeToHistory(user.uuid, '<', '', welcome_flow.node1.prompt)
                return {
                    prompt: welcome_flow.node1.prompt,
                    options: Object.keys(welcome_flow.node1.answers)
                }
            });
        }
        else {
            let user_state = user_state_obj.state
            console.log("found user state", user_state)
            let flow_name = user_state.split(".")[0]
            let node = user_state.split(".")[1]
            console.log("==> Current state, (flow,node)",  flow_name, node)
            let options
            let flow = flow_mapping[flow_name]
            // console.log("==> flow ",flow)
            let next_node_id = flow[node].answers.follow_up
            console.log("=>next_node_id ", next_node_id, flow[node].answers)
            let next_flow_name = flow_name
            let next_node = flow[node][next_node_id]

            if (flow[node].open_answer) {
                // open answer
                if(flow[node].answers.code){
                    let code_file_name = flow[node].answers.code
                    next_node_data = await code_handlers[code_file_name]['process'](user,query)
                    console.log("==> next_node_data, ", next_node_data)
                    next_node=flow_mapping[next_node_data.flow_name][next_node_data.node]
                    next_flow_name = next_node_data.flow_name
                    next_node_id = next_node_data.node
                }else{
                    next_node_id = flow[node].answers.follow_up
                    next_node = flow[next_node_id]
                    console.log("next_node, flow", next_node, flow)
                    if (flow[next_node_id].open_answer) {

                    } else {
                        options = Object.keys(flow[next_node_id].answers)
                    }
                }
            } else {
                console.log(flow[node].answers[query].follow_up)
                next_node_id = flow[node].answers[query].follow_up
                next_node = flow[next_node_id]
                if (flow[next_node_id].open_answer) {
                } else {
                    options = Object.keys(flow[next_node_id].answers)
                }
            }
            console.log(" next node: ", next_flow_name, next_node_id, next_node)
            let msg = next_node.prompt
            if (node === "node1") { msg = query + ", " + msg }
            await db.writeToHistory(user.uuid, '<', '', msg)
            return db.setState(user.uuid, next_flow_name + "." + next_node_id).then(user_state => {
                if (options !== undefined) {
                    return {
                        prompt: msg,
                        options
                    }
                } else {
                    return msg
                }
            });
        }
    });
}