module.exports = function(sequelize, DataTypes) {
    var Loan = sequelize.define('Loan', {
        
    }, {
        classMethods: {
            associate: function (models) {
                Loan.belongsTo(models.User);
            }
        }
    });
    return Loan;
}
