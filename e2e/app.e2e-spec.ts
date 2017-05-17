import { MancalaPage } from './app.po';

describe('mancala App', () => {
  let page: MancalaPage;

  beforeEach(() => {
    page = new MancalaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
