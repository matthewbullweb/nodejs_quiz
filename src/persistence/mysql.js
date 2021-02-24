const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql');

const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env;

let pool;

async function init() {
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
    const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
    const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

    await waitPort({ host, port : 3307, timeout: 15000 });

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
    });

    return new Promise((acc, rej) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
            err => {
                if (err) return rej(err);

                console.log(`Connected to mysql db at host ${HOST}`);
                console.log(`Table todo_items created`);
                acc();
            },
        );

        pool.query(
            'CREATE TABLE IF NOT EXISTS answers (id bigint(20) NOT NULL AUTO_INCREMENT,qid varchar(36) DEFAULT NULL,value varchar(255) DEFAULT NULL,KEY answers_id_IDX (id) USING BTREE)',
            err => {
                if (err) return rej(err);

                console.log(`Table answers created`);
                acc();
            },
        );

    });
}

async function teardown() {
    return new Promise((acc, rej) => {
        pool.end(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function getItems() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items', (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                ),
            );
        });
    });
}

async function getItem(id) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                )[0],
            );
        });
    });
}

async function storeItem(item) {
    return new Promise((acc, rej) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function updateItem(id, item) {
    return new Promise((acc, rej) => {
        pool.query(
            'UPDATE todo_items SET name=?, completed=? WHERE id=?',
            [item.name, item.completed ? 1 : 0, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function removeItem(id) {
    return new Promise((acc, rej) => {
        pool.query('DELETE FROM todo_items WHERE id = ?', [id], err => {
            if (err) return rej(err);
            acc();
        });
    });
}

async function getAnswers() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM answers', (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(answers =>
                    Object.assign({}, answers, {}),
                ),
            );
        });
    });
}

async function getAnswer(qid) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM answers WHERE qid=?', [qid], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(answer =>
                    Object.assign({}, answer, {}),
                ),
            );
        });
    });
}

async function storeAnswer(answer) {
    return new Promise((acc, rej) => {
        pool.query(
            'INSERT INTO answers (qid, value) VALUES (?,?)',
            [answer.qid, answer.value],
            function(err, result, fields){
                if (err) return rej(err);
                console.log('msql: ' + result.insertId);
                acc(result.insertId);
            }
        );
    });
}

async function removeAnswer(id) {
    return new Promise((acc, rej) => {
        pool.query('DELETE FROM answers WHERE id = ?', [id], err => {
            if (err) return rej(err);
            acc();
        });
    });
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
    getAnswers,
    getAnswer,
    storeAnswer,
    removeAnswer,
};
