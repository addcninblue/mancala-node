module.exports = function (app) {
  app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
  });

  app.get('/game.js', (req, res) => {
    res.sendFile(`${__dirname}/public/game.js`);
  });

  app.get('/index.css', (req, res) => {
    res.sendFile(`${__dirname}/public/index.css`);
  });
};
