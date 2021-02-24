const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const location = process.env.SQLITE_DB_LOCATION || '/etc/Items/Item.db';

let db, dbAll, dbRun;

function init() {
    const dirName = require('path').dirname(location);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    return new Promise((acc, rej) => {
        db = new sqlite3.Database(location, err => {
            if (err) return rej(err);

            if (process.env.NODE_ENV !== 'test')
                console.log(`Using sqlite database at ${location}`);

            db.run(
                'CREATE TABLE IF NOT EXISTS Items (id varchar(36), name varchar(255), completed boolean)',
                (err, result) => {
                    if (err) return rej(err);
                    acc();
                },
            );
        });
    });
}

async function teardown() {
    return new Promise((acc, rej) => {
        db.close(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function getItems() {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM Items', (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(Item =>
                    Object.assign({}, Item, {
                        completed: Item.completed === 1,
                    }),
                ),
            );
        });
    });
}

async function getItem(id) {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM Items WHERE id=?', [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(Item =>
                    Object.assign({}, Item, {
                        completed: Item.completed === 1,
                    }),
                )[0],
            );
        });
    });
}

async function storeItem(Item) {
    return new Promise((acc, rej) => {
        db.run(
            'INSERT INTO Items (id, name, completed) VALUES (?, ?, ?)',
            [Item.id, Item.name, Item.completed ? 1 : 0],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function updateItem(id, Item) {
    return new Promise((acc, rej) => {
        db.run(
            'UPDATE Items SET name=?, completed=? WHERE id = ?',
            [Item.name, Item.completed ? 1 : 0, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
} 

async function removeItem(id) {
    return new Promise((acc, rej) => {
        db.run('DELETE FROM Items WHERE id = ?', [id], err => {
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
};
