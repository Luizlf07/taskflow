'use strict';

const app = require('./app');
const { init } = require('./db');

const PORT = process.env.PORT || 3000;

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TaskFlow rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Nao foi possivel conectar ao banco:', error.message);
    process.exit(1);
  });
