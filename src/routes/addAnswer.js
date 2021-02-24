const db = require('../persistence');

module.exports = async (req, res) => {
    const answer = {
        qid: req.body.qid,
        value: req.body.value,
    };

    answer.id = await db.storeAnswer(answer);

    res.send(answer);
};
