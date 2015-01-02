function getTables () {    
    var documentPackageTable = {
        columns: [
            {
                name: 'id',
                dataType: 'INT',
                notNull: true,
                autoIncrement: true
            },
            {
                name: 'user_id',
                dataType: 'INT',
                notNull: true
            },
            {
                name: 'banker_user_id',
                dataType: 'INT'
            },
            {
                name: 'name',
                dataType: 'VARCHAR(250)',
                default: 'document package'
            }
        ],
        indices: [
            {
                columnNames: ['id']
            }
        ],
        constraints: [
            {
                columnNames: ['id'],
                isPrimary: true
            }
        ],
        baseData: [
            {
                user_id: 1,
                name: 'Created by me!!'
            },
            {
                user_id: 1,
                banker_user_id: 2,
                name: 'Created by banker 2'
            }
        ]
    };
    var documentTable = {
        columns: [
            {
                name: 'id',
                dataType: 'INT',
                notNull: true,
                autoIncrement: true,
            },
            {
                name: 'document_package_id',
                dataType: 'INT',
                notNull: true
            },
            {
                name: 'group_name',
                dataType: 'VARCHAR(250)'
            },
            {
                name: 'path',
                dataType: 'VARCHAR(250)'
            }
        ],
        indices: [
            {
                columnNames: ['id']
            },
            {
                columnNames: ['document_package_id']
            }
        ],
        constraints: [
            {
                columnNames: ['id'],
                isPrimary: true
            }
        ],
        baseData: []
    };
    return {
        document_package: documentPackageTable,
        document: documentTable
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
