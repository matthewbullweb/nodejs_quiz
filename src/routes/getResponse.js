const db = require('../persistence');

module.exports = async (req, res) => {
    const response = await db.getResponse(req.params.qid,req.params.uid);
    res.send(response);
};
