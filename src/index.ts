import Spider from './spider';

const init = async () => {
    const spider = new Spider({ devtools: false });
    spider.startup();
};

init();
