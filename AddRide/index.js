const azure = require('azure-storage');
const uuid = require('uuid/v1');

const tableService = azure.createTableService();

const tableName = "rides";

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
// Status could be: active, inactive, inprogress, canceled, completed


// {
// 	"CarId": "08f376f0-82ac-11e9-a0e1-2593447bd379",
// 	"DateTime": "2019-06-06T06:43:11.903Z",
// 	"Destinations": "[Heredia, Alajuela]",
// 	"Details":"--optional--",
// 	"OriginPoint":"La Sanana",
// 	"Seats":"4",
// 	"Status":"active",
// 	"UserId":"1"
// }