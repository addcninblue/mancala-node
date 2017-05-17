module.exports = function (app) {
  app.get('/polyfills.bundle.js', (req, res) => {
    res.sendFile(`${__dirname}/dist/polyfills.bundle.js`);
  });

  app.get('/main.bundle.js', (req, res) => {
    res.sendFile(`${__dirname}/dist/main.bundle.js`);
  });

  app.get('/styles.bundle.js', (req, res) => {
    res.sendFile(`${__dirname}/dist/styles.bundle.js`);
  });

  app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/dist/index.html`);
  });

  app.get('/vendor.bundle.js', (req, res) => {
    res.sendFile(`${__dirname}/dist/vendor.bundle.js`);
  });

  app.get('/inline.bundle.js', (req, res) => {
    res.sendFile(`${__dirname}/dist/inline.bundle.js`);
  });

  app.get('*', (req, res) => {
    res.sendFile(`${__dirname}/dist/index.html`);
  });

  // app.get('/game.js', (req, res) => {
  //   res.sendFile(`${__dirname}/public/game.js`);
  // });

  // app.get('/index.css', (req, res) => {
  //   res.sendFile(`${__dirname}/public/index.css`);
  // });
};
