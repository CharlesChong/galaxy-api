var db = require('../../db');
var user = require('../../lib/user');


module.exports = function(server) {
    // Sample usage:
    // % curl -X POST 'http://localhost:5000/user/acl' -d 'id=1&dev=1&reviewer=1&admin=1'
    // TODO: Make sure only admins can do this
    server.post({
        url: '/user/acl',
        validation: {
            id: {
                description: 'User ID to change permissions for',
                isRequired: true
            },
            dev: {
                description: 'Whether or not user should have developer permissions',
                isRequired: true,
                isIn: ['0', '1']
            },
            reviewer: {
                description: 'Whether or not user should have reviewer permissions',
                isRequired: true,
                isIn: ['0', '1']
            },
            admin: {
                description: 'Whether or not user should have admin permissions',
                isRequired: false,
                isIn: ['0', '1']
            }
        },
        swagger: {
            nickname: 'acl',
            notes: 'Update User Permissions',
            summary: 'ACL'
        }
    }, db.redisView(function(client, done, req, res) {
        var POST = req.params;

        var userID = POST.id;
        // Convert from string to bool
        var isDev = !!+POST.dev;
        var isRev = !!+POST.reviewer;
        var isAdmin = !!+POST.admin || false;

        console.log('Attempting permission update:');

        user.getUserFromID(client, userID, function(err, resp) {
            if (err || !resp) {
                res.json(500, {error: err || 'db_error'});
                done();
                return;
            }

            var newData = user.updateUser(client, resp, {
                permissions: {
                  developer: isDev,
                  reviewer: isRev,
                  admin: isAdmin
                }
            });

            res.json(200, {
                permissions: newData.permissions
            });

            done();

        });
        
      })
    );
};