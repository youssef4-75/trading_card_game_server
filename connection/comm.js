

export function communicationPost(app, route, requestHandler){
    app.post(route, async (req, res) => {
        const result = await requestHandler(req);  // Get name from the request body
        res.send(result);  // Send response back to client
    });
}


export function communicationGet(app, route, response){
    app.get(route, (req, res) => {
        res.send(response);
    });
}

