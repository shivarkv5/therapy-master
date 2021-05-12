
exports.process=(user, query, params)=>{
    return new Promise((resolve,reject)=>{
        console.log("=> Running code: params ", user, query, params)
        resolve({flow_name: "depression", node: "node1"})
    })
}
let df = require('./df1')


exports.callDF=(query)=>{
    return df.getDFResult('', 'session1', query).then(async data => {
    if (data.action !== 'input.unknown') {
        console.log(data.platform)
        if (data.fulfillmentMessages[0].platform === 'FACEBOOK') {
            return data.fulfillmentMessages[0].text.text[0]
                // data.fulfillmentMessages.length>1?(options:(data.fulfillmentMessages[1].quickReplies.quickReplies)):(data:"")
             
        } else {
            await db.writeToHistory(user.uuid, '<', '', data.fulfillmentText)
            return data.fulfillmentText
        }
    }else{
        return undefined
    }
    });
}