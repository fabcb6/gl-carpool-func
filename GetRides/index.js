const azure = require('azure-storage');

const tableService = azure.createTableService();
const tableName = "rides";

// return a car by the Id
const GetById = (id, context) => {
    // return item with RowKey 'id'
    tableService.retrieveEntity(tableName, 'Partition', id, function (error, result, response) {
        if (!error) {
            context.res.status(200).json(response.body);
        }
        else {
            context.res.status(500).json({error : error});
        }
    });
};

// return the top 5 cars from a User
const GetByUserId = (UserId, context) => {
    var query = new azure.TableQuery()
        .top(5)
        .where('UserId eq ? ', UserId);
        
    tableService.queryEntities(tableName, query, null, function(error, result, response) {
        if (!error) {
            context.res.status(200).json(response.body.value);
        }
        else {
            context.res.status(500).json({error : error});
        }
    });
};

// return the top 100 items
const GetAll = context => {
    var query = new azure.TableQuery().top(100);
    tableService.queryEntities(tableName, query, null, function (error, result, response) {
        if(!error){
            context.res.status(200).json(response.body.value);
        } else {
            context.res.status(500).json({error : error});
        }
    });
}

module.exports = function (context, req) {
    context.log('Start ItemRead');

    if (req.query.id) {
        GetById(req.query.id, context);
    }
    else {
        if (req.query.UserId) {
            GetByUserId(req.query.UserId, context);
        }
        else {
            GetAll(context);
        }
    }
};