const azure = require('azure-storage');

const tableService = azure.createTableService();
const tableName = 'rides';
const passengersTable = 'passengers';
const usersTable = 'users';

// return a ride by id and the passengers approved
const GetById = async (id, context) => {
    try {
        let rideInfo = await GetByRideId(id);
        let passengersResult = await GetPassengers(id);
        let usersResult = await GetUsersInfo(passengersResult);

        context.res.status(200).json({ ...rideInfo, passengers: usersResult});
    } catch(e) {
        context.res.status(500).json({ error: e });
    }
  }

  const GetByRideId = async (id) => {
    return new Promise(resolve => {
        tableService.retrieveEntity(tableName, 'Partition', id, function (error, result, response) {
            if (!error) {
                resolve(response.body);
            }
            else {
                resolve('fail');
            }
        });
    });
  };

// return the top 50 rides from a user
const GetByUserId = (UserId, context) => {
    var query = new azure.TableQuery()
        .top(50)
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

const GetPassengers =  RideId => {
    return new Promise(resolve => {
        let query = new azure.TableQuery()
        .top(20)
        .where('RideId eq ? ', RideId)
        .and('Status eq ?', 'approved');
    
        tableService.queryEntities(passengersTable, query, null, function(error, result, response) {
            if (!error) {
                resolve(response.body.value);
            }
            else {
                resolve('fail');
            }
        });
    });
};

const GetUsersInfo = passengers => {
    return new Promise(resolve => {
        let query = new azure.TableQuery()
            .top(20)
            .where('Partition eq ? ', 'Partition');
        
        passengers.forEach((item, index) => {
            if (item.UserId !== null) {
                query = query
                .or('RowKey eq ?', item.UserId );
            }
        })

        tableService.queryEntities(usersTable, query, null, function(error, result, response) {
            if (!error) {
                resolve(response.body.value);
            }
            else {
                resolve('fail');
            }
        }); 
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