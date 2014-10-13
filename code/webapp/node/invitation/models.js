module.exports = function(sequelize, DataTypes) {
    var Invite = sequelize.define('Invite', {
        code: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function (models) {
                Invite.belongsTo(models.User, {
                    as: 'SentUser',
                    foreignKey: 'sentUserId'
                });
                Invite.belongsTo(models.User, {
                    as: 'ReceivedUser',
                    foreignKey: 'receivedUserId'
                });
            }
        }
    });
    return Invite
}
