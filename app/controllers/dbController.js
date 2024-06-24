const dbModel = require('../models/dbModel');


exports.createFormEntry = (req, res) => {
    const { name, option, message } = req.body;
    if (!name || !option || !message) {
        return res.status(400).send('Tous les champs sont requis');
    }

    dbModel.createForm(name, option, message, (err, id) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur lors de l\'insertion dans la base de données');
        }
        res.redirect('/');

    });
};

exports.getForms = (req, res) => {
    dbModel.getForms((err, logs) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json(logs);
      }
    });
  };