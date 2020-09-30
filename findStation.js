var unirest = require('unirest');
var crypto = require('crypto');
var key = process.argv[2];
var user = process.argv[3];
var name = process.argv[4];

function createSignature(text) {
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(JSON.stringify(text));
    var sig = hmac.digest('base64');
    console.log('sig: ', sig);
    return sig;
}

function getStationId() {
    data = {
        "version": 38,
        "coordinateType": "EPSG_4326",
        "maxList": 1,
        "theName": {
            "name": name,
            "type": "STATION"
        }
    };
    var sig = createSignature(data);
    unirest.post('https://gti.geofox.de/gti/public/checkName')
        .headers({
            'Content-Type': 'application/json;charset=UTF-8',
            'geofox-auth-signature': sig,
            'geofox-auth-user': user
        })
        .send(JSON.stringify(data))
        .end(function (response) {
            if (response.error) {
                console.error(response.error);
                console.debug(response.body);
            } else {
                console.log("ID: ", response.body.results[0].id);
            }
        });
}

getStationId();
