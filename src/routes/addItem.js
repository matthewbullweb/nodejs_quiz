const db = require('../persistence');
const uuid = require('uuid/v4');

module.exports = async (req, res) => {
    const Item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
    };

    await db.storeItem(Item);
    res.send(Item);
};
