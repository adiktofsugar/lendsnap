var manyToMany = function (t1, t2) {
    return "CREATE TABLE IF NOT EXISTS " + t1 + "_" + t2 + "(" +
        t1 + "_id INT NOT NULL, " +
        t2 + "_id INT NOT NULL, " +
        "INDEX (" + t1 + "_id), " +
        "INDEX (" + t2 + "_id));";
};

module.exports = {
    "document_package": {
        create: "CREATE TABLE IF NOT EXISTS document_package (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
            "user_id INT NOT NULL, " +
            "name VARCHAR(250) DEFAULT 'document package', " +
            "INDEX (id), " +
            "INDEX (user_id));",
        baseData: "INSERT INTO document_package " +
            "(id, user_id) " + 
            "VALUES " + 
            "(1, 1), " +
            "(2, 1);"
    },
    "document": {
        create: "CREATE TABLE IF NOT EXISTS document (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
            "document_package_id INT NOT NULL, " +
            "name VARCHAR(250), " +
            "group_name VARCHAR(250), " +
            "path VARCHAR(250), " +
            "INDEX (id), " +
            "INDEX (document_package_id));",
        baseData: "INSERT INTO document " +
            "(id, document_package_id, name, path) " +
            "VALUES " +
            "(1, 1, 'doc1', 'a.pdf'), " +
            "(2, 1, 'doc2', 'b.pdf'), " +
            "(3, 1, 'doc3', 'c.pdf'), " +
            "(4, 2, 'doc4', 'd.pdf');"
    }
};
