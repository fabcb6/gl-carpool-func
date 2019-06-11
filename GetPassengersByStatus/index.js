import { Stats } from 'fs';

const azure = require('azure-storage');

const tableService = azure.createTableService();
const tableName = "passengers";

// return a specific passenger by id
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

// return the top 5 passengers from a User
const GetByRideId = (RideId, Status, context) => {
    let query = new azure.TableQuery()
        .top(20)
        .where('RideId eq ? ', RideId);

    const statusValues = ['pending', 'approved', 'denied'];
    if ((Status !== undefined) && (statusValues.indexOf(Status))){
        query = new azure.TableQuery()
            .top(20)
            .where('RideId eq ? ', RideId)
            .and('Status eq ?', Stats);
    }
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
    const query = new azure.TableQuery().top(100);
    tableService.queryEntities(tableName, query, null, function (error, result, response) {
        if(!error){
            context.res.status(200).json(response.body.value);
        } else {
            context.res.status(500).json({error : error});
        }
    });
}

const GetUserValues = passengersResult => {
    return passengersResult;
}

module.exports = function (context, req) {
    context.log('Start ItemRead');

    if (req.query.id) {
        GetById(req.query.id, context);
    }
    else {
        if (req.query.RideId) {
            GetByRideId(req.query.RideId, req.query.Status, context);
        }
        else {
            GetAll(context);
        }
    }
};