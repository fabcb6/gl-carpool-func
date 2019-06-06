const azure = require('azure-storage');

const tableService = azure.createTableService();
const tableName = "cars";

module.exports = function (context, req) {
    context.log('Start ItemUpdate');

    if (req.body) {

        // TODO: Add some object validation logic
        const item = req.body;

        // Depending on how you want this to behave you can also use tableService.mergeEntity
        tableService.replaceEntity(tableName, item, function (error, result, response) {
            if (!error) {
                context.res.status(202).json(result);
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
// {
//     "odata.metadata": "https://carpoolglstorage.table.core.windows.net/$metadata#cars/@Element",
//     "odata.etag": "W/\"datetime'2019-06-04T05%3A13%3A47.9948009Z'\"",
//     "PartitionKey": "Partition",
//     "RowKey": "88766c00-8687-11e9-8b58-574fa7760b3f",
//     "Timestamp": "2019-06-04T05:13:47.9948009Z",
//     "Color": "Yellor",
//     "Model": "Kia - Rio",
//     "Plate": "WTF-678"
// }