module.exports = function(sequelize, DataTypes) {
    var Invite = sequelize.define('Invite', {
        code: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Invite.belongsTo(models.User);
            }
        }
    });
    return Invite
}
