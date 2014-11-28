// TODO: Credentials should all come from outside.
// docker can set environment variables, so maybe thats a good way?


module.exports = {
    dbHost: 'db',
    dbName: process.env.DB_ENV_LS_NAME,
    dbUser: process.env.DB_ENV_LS_USER,
    dbPassword: process.env.DB_ENV_LS_PASSWORD,
    dbRootPassword: process.env.DB_ENV_LS_ROOT_PASSWORD
};
