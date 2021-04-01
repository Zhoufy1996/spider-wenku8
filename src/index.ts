import Spider from './spider';

const init = async () => {
    const spider = new Spider({ devtools: true });
    await spider.createBrowser();
    await spider.createPage();
    await spider.login();
    await spider.goToList();
    await spider.goToDetail();
    await spider.goToDownload();
};

init();
