var crypto = require('crypto');
var encodePassword = function (passwordString) {
    return crypto.createHash('sha1')
        .update(passwordString).digest('hex');
};

function getTables () {    
    var userTable = {
        columns: [
            {
                name: 'id',
                dataType: 'INT',
                notNull: true,
                autoIncrement: true
            },
            {
                name: 'email',
                dataType: 'VARCHAR(250)',
                notNull: true
            },
            {
                name: 'first_name',
                dataType: 'VARCHAR(250)'
            },
            {
                name: 'last_name',
                dataType: 'VARCHAR(250)'
            },
            {
                name: 'password',
                dataType: 'VARCHAR(250)'
            },
            {
                name: 'is_banker',
                dataType: 'TINYINT(1)',
                default: '0'
            },
            {
                name: 'is_admin',
                dataType: 'TINYINT(1)',
                default: '0'
            }
        ],
        indices: [
            {
                columnNames: ['id']
            },
            {
                columnNames: ['email']
            }
        ],
        constraints: [
            {
                columnNames: ['id'],
                isPrimary: true
            },
            {
                columnNames: ['email'],
                isUnique: true
            }
        ],
        baseData: [
            {
                email: 'user1@example.org',
                first_name: 'Charles',
                last_name: 'Awesome',
                password: encodePassword('a')
            },
            {
                email: 'user2@example.org',
                first_name: 'The',
                last_name: 'Banker',
                password: encodePassword('a'),
                is_banker: 1
            },
            {
                email: 'admin@example.org',
                first_name: 'Admin',
                password: encodePassword('a'),
                is_admin: 1
            }
        ]
    };
    var bankTable = {
        columns: [
            {
                name: 'id',
                dataType: 'INT',
                notNull: true,
                autoIncrement: true,
            },
            {
                name: 'name',
                dataType: 'VARCHAR(250)',
                notNull: true
            }
        ],
        indices: [
            {
                columnNames: ['id']
            },
            {
                columnNames: ['name']
            }
        ],
        constraints: [
            {
                columnNames: ['id'],
                isPrimary: true
            },
            {
                columnNames: ['name'],
                isUnique: true
            }
        ],
        baseData: [
            {
                name: 'Wells Fargo'
            }
        ]
    };
    var userToBankTable = {
        columns: [
            {
                name: 'user_id',
                dataType: 'INT',
                notNull: true
            },
            {
                name: 'bank_id',
                dataType: 'INT',
                notNull: true
            }
        ],
        indices: [
            {
                columnNames: ['user_id']
            },
            {
                columnNames: ['bank_id']
            }
        ],
        constraints: [],
        baseData: [
            {
                user_id: 2,
                bank_id: 1
            }
        ]
    };
    return {
        user: userTable,
        bank: bankTable,
        user_bank: userToBankTable
    };
}
function getEditableFieldNames(tableName) {
    var table = getTables()[tableName];
    if (!table) {
        throw new Error("No table named \"" + tableName + "\"");
    }
    return table.columns.map(function (column) {
            if (column.name !== "id") {
                return column.name;
            }
            return;
        });
}

module.exports = {
    getTables: getTables,
    getEditableFieldNames: getEditableFieldNames
};
