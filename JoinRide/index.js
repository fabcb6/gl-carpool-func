const azure = require('azure-storage');
const uuid = require('uuid/v1');

const tableService = azure.createTableService();

const tableName = "passengers";

module.exports = function (context, req) {
    context.log('Start ItemCreate');

    if (req.body) {
        // TODO: Add some object validation logic 

        const item = req.body;
        item["PartitionKey"] = "Partition";
        item["RowKey"] = uuid();

        tableService.insertEntity(tableName, item, { echoContent: true }, function (error, result, response) {
            if (!error) {
                context.res.status(201).json(response);
            } else {
                context.res.status(500).json({ error: error });
            }
        });
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an item in the request body"
        };
        context.done();
    }
}

// Example
// Status could be: “pending”, “approved” and “denied” 
// For the JoinRide function the idea is to set it as pending and the driver approves or denied the request

// {
// 	"RideId": "1",
// 	"Status":"pending",
// 	"UserId":"1"
// }