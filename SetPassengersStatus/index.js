const azure = require('azure-storage');

const tableService = azure.createTableService();
const tableName = "passengers";
const tableRide = 'rides';

const getRideInfo = RideId => {
    
    return new Promise(resolve => {
        tableService.retrieveEntity(tableRide, 'Partition', RideId, function (error, result, response) {
            if (!error) {
                // return(response.body);
                resolve(response.body);
            }
            else {
                // return null;
                resolve('fail');
            }
        });
      });
};

const updateRide = ride => {
    return new Promise(resolve => {
        tableService.replaceEntity(tableRide, ride, function (error, result, response) {
            if (!error) {
                resolve('resolved');
            } else {
                resolve('fail');
            }
        });
      });
};

const updatePassenger = item => {
    return new Promise(resolve => {
        tableService.replaceEntity(tableName, item, function (error, result, response) {
            if (!error) {
                resolve(result);
            } else {
                resolve('fail');
            }
        });
      });
};

const setStatus = async (context, item) => {
    try {
        let resultRide = await getRideInfo(item.RideId);

        if ((resultRide !== 'fail') && (resultRide.Seats > 0)) {
            const newSeats = parseInt(resultRide.Seats) - 1;  // This is in case that it was stored as string.
            let resultAddSeat = await updateRide({...resultRide, 'Seats':newSeats});

            if (resultAddSeat !== 'fail') {
                let resultPassenger = await updatePassenger(item);
        
                if (resultPassenger !== 'fail') {
                    context.res.status(202).json(item);
                } else {
                    context.res.status(500).json({ error: 'Error updating the passenger status' });
                }
            } else {
                context.res.status(500).json({ error: 'Error updating the seats amount' });
            }
        } else {
            context.res.status(500).json({ error: 'No seats available' });
        }

        
      } catch(e) {
        context.res.status(500).json({ error: e });
      }
}

module.exports = function (context, req) {
    context.log('Start ItemUpdate');

    if (req.body) {

        // TODO: Add some object validation logic
        const item = req.body;

        setStatus(context, item);
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