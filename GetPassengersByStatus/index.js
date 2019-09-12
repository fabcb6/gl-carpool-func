const azure = require('azure-storage');

const tableService = azure.createTableService();
const tableName = 'passengers';

// return a specific passenger by id
const GetById = (id, context) => {
    // return item with RowKey 'id'
    tableService.retrieveEntity(tableName, 'Partition', id, function (error, result, response) {
        if (!error) {
            // context.res.status(200).json(response.body);
            GetUserValues([response.body], context);
        }
        else {
            context.res.status(500).json({error : error});
        }
    });
};

const GetByRideId = (RideId, Status, context) => {
    let query = new azure.TableQuery()
        .top(20)
        .where('RideId eq ? ', RideId);

    const statusValues = ['pending', 'approved', 'denied'];
    if ((Status !== undefined) && (statusValues.indexOf(Status))){
        query = query
            .and('Status eq ?', Status);
    }
    
    tableService.queryEntities(tableName, query, null, function(error, result, response) {
        if (!error) {
            // context.res.status(200).json(response.body.value);
            GetUserValues(response.body.value, context);
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
            // context.res.status(200).json(response.body.value);
            GetUserValues(response.body.value, context);
        } else {
            context.res.status(500).json({error : error});
        }
    });
}

const GetUserValues = (passengersResult, context) => {

    const tableUsers = "users";

    let query = new azure.TableQuery()
        .top(20)
        .where('Partition eq ? ', 'Partition');
    
    passengersResult.forEach((item, index) => {
        if (item.UserId !== null) {
            query = query
            .or('RowKey eq ?', item.UserId );
        }
    })

    tableService.queryEntities(tableUsers, query, null, function(error, result, response) {
        if (!error) {
            const merge = (a, b) => {
                let result = [];
                if(a.length > 0) {
                    a.forEach(aitem => {
                        let bitem = b.find ( bitem => aitem['UserId'] === bitem['RowKey']);
                        if(bitem) {
                            result.push({...aitem, ...bitem })
                        }
                    })
                }
                return result;
            };
            let pr = passengersResult;
            let ur = response.body.value;

            context.res.status(200).json(merge(pr, ur));
        }
        else {
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
        if (req.query.RideId) {
            GetByRideId(req.query.RideId, req.query.Status, context);
        }
        else {
            GetAll(context);
        }
    }
};