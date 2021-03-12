const db = require('../persistence');

module.exports = async (req, res) => {
    const response = {
        qid: req.body.qid,
        uid: req.body.uid,
        aid: req.body.aid,
    };

    response.id = await db.storeResponse(response);

    res.send(response);
};
