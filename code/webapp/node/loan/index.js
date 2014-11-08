var isUserReadyToApplyForLoan = function (user, cb) {
    var isReady = user.firstName && user.lastName && user.gender;
    cb(null, !!isReady);
};
var getCurrentLoanForUser = function (user, cb) {
    user.getLoans({
        order: "id asc",
        limit: 1
    })
    .then(function (loans) {
        cb(null, loans[0]);
    }, cb);
};

module.exports = {
    isUserReadyToApply: isUserReadyToApplyForLoan,
    getCurrentForUser: getCurrentLoanForUser
};
