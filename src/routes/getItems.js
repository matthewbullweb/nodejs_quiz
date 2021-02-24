const db = require('../persistence');

module.exports = async (req, res) => {
    const Items = await db.getItems();
    res.send(Items);
};
