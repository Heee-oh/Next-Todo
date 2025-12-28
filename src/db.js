const { ipcRenderer } = window.require('electron');
const { Sequelize, DataTypes, Op } = window.require('sequelize');
const path = window.require('path');

let sequelize;
let Todo;

const getDbPath = async () => {
  const userDataPath = await ipcRenderer.invoke('get-user-data-path');
  return path.join(userDataPath, 'database.sqlite');
};

const init = async () => {
  if (sequelize) {
    return;
  }
  const dbPath = await getDbPath();
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });

  Todo = sequelize.define('Todo', {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  await sequelize.sync();
};

const getModel = () => Todo;
const getSequelizeOp = () => Op;

export { init, getModel, getSequelizeOp };
