const azure = require('azure-storage');
const uuid = require('uuid/v1');

const tableService = azure.createTableService();
const tableName = "users";

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
        // Return an error if we don't revceive an object
        context.res = {
            status: 400,
            body: "Please pass an item in the request body"
        };
        context.done();
    }
}

// Example:
// {
//     "Name": "New User",
//     "Position": "Wroking hard at home",
//     "Profile": "passenger"
// }