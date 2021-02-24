const db = require('../persistence');

module.exports = async (req, res) => {
    await db.removeAnswer(req.params.id);
    res.sendStatus(200);
};
