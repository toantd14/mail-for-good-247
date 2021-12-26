const db = require("../../models");

module.exports = () => {
  const { sequelize } = db;

  sequelize.sync({ force: true, hooks: true });
};
