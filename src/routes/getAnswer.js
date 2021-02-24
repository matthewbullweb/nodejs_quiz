const db = require('../persistence');

module.exports = async (req, res) => {
    await db.getAnswer(req.params.qid);
    const answer = await db.getAnswer(req.params.qid);
    res.send(answer);
};
