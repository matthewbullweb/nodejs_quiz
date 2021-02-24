const db = require('../persistence');

module.exports = async (req, res) => {
    //const ans = await db.getAnswers();
    const ans = [];
    res.send(ans);
};
