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
            }
        },
        instanceMethods: {
            canInvite: function () {
                return true;
            }
        }
    });
    return User
}
