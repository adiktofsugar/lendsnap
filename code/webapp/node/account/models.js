module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                User.hasMany(models.Invite, {
                    as: 'SentInvites',
                    foreignKey: 'sentUserId'
                });
                User.hasMany(models.Invite, {
                    as: 'ReceivedInvites',
                    foreignKey: 'receivedUserId'
                });

                User.hasMany(models.Permission);
                User.hasMany(models.Bank);
            }
        }
    });

    var Permission = sequelize.define('Permission', {
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Permission.hasMany(models.User);
                Permission.hasMany(models.Bank);
            }
        },
        instanceMethods: {
            hasGetUser: function (userInfo, cb) {
                // will eventually implement this...
                cb(null, true);
            },
            has: function (otherPermissionInfo, cb) {
                var specificHasFunctionName = "has" + this.name.slice(0,1) + this.name.slice(1);
                if (this[specificHasFunctionName]) {
                    this[specificHasFunctionName](otherPermissionInfo, cb);
                } else {
                    cb(null, true);
                }
            }
        }
    });
    var Bank = sequelize.define('Bank', {
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Bank.hasMany(models.User);
                Bank.hasMany(models.Permission);
            }
        }
    });
    return [User, Permission, Bank];
}
