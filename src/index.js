// Helper functions for accessing the discord API.
var https = require('https');
var Parse = require('parse/node').Parse;

function validateAuthToken(id, token) {
    return request("users/@me", token)
        .then((response) => {
            if (response && response.id == id) {
                return;
            }
            throw new Parse.Error(
                Parse.Error.OBJECT_NOT_FOUND,
                'Discord auth is invalid for this user.');
        });
}

// Returns a promise that fulfills if this user id is valid.
function validateAuthData(authData) {
    return validateAuthToken(authData.id, authData.access_token).then(() => {
        // Validation with auth token worked
        return;
    });
}

// Returns a promise that fulfills if this app id is valid.
function validateAppId() {
    return Promise.resolve();
}

// A promisey wrapper for api requests
function request(path, token) {
    return new Promise(function(resolve, reject) {
        https.get({
            hostname: "discordapp.com",
            path: "/api/v6/" + path,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, function(res) {
            var data = '';
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                try {
                    data = JSON.parse(data);
                } catch(e) {
                    return reject(e);
                }
                resolve(data);
            });
        }).on('error', function() {
            reject('Failed to validate this access token with Discord.');
        });
    });
}

module.exports = {
    validateAppId: validateAppId,
    validateAuthData: validateAuthData
};