import puppeteer from 'puppeteer';
import config from './config.json';

interface SpiderProps {
    devtools?: boolean;
}

interface LoginProps {
    username: string;
    password: string;
}

interface NovelProps {
    pageNumber: number;
    novelCount: number;
}

interface UrlData {
    url: string;
}

class Spider {
    private browser: puppeteer.Browser | undefined;

    private devtools: boolean;

    private page: puppeteer.Page | undefined;

    private pageNumber: number = 1;

    private novelCount: number = 0;

    constructor(props?: SpiderProps) {
        this.devtools = props?.devtools || false;
    }

    async createBrowser() {
        this.browser = await puppeteer.launch({
            devtools: this.devtools,
        });
    }

    async createPage() {
        this.page = await this.browser?.newPage();
    }

    async login() {
        await this.page?.goto('https://www.wenku8.net/login.php', { waitUntil: 'networkidle2' });
        this.page?.evaluate((context: LoginProps) => {
            const inputs = document.querySelectorAll('input');
            inputs[0].value = context.username;
            inputs[1].value = context.password;
            inputs[inputs.length - 1].click();
        }, config);

        await this.page?.waitForNavigation();
    }

    async goToList() {
        await this.page?.goto('https://www.wenku8.net/index.php', { waitUntil: 'networkidle2' });
        await this.page?.evaluate(() => {
            const navList = document.querySelector('.navlist');
            if (navList) {
                const links = navList.querySelectorAll('a');
                links[1].click();
            }
        });
        await this.page?.waitForNavigation();
    }

    async goToDetail() {
        this.page?.evaluate(
            (context: NovelProps) => {
                const content = document.querySelector('#content');
                if (content) {
                    const novelLinks = content.querySelectorAll<HTMLAnchorElement>('b > a');
                    console.log(novelLinks, context.novelCount);
                    novelLinks[context.novelCount].click();
                }
            },
            { pageNumber: this.pageNumber, novelCount: this.novelCount }
        );
        await this.page?.waitForNavigation();
    }

    async goToDownload() {
        this.page?.evaluate(() => {
            const links = document.querySelectorAll<HTMLAnchorElement>('fieldset > div > a');
            const downloadLink = Array.from(links).find((link) => link.innerHTML === 'TXT简繁全本');
            if (downloadLink) {
                downloadLink.click();
            }
        });
        await this.page?.waitForNavigation();
    }

    async getDownloadUrl() {
        const url = await this.page?.evaluate(() => {
            const doms = document.querySelectorAll('.even');
            const downloadsUrl = doms[doms.length - 1];
            const childNodes = Array.from(downloadsUrl.childNodes);
            // 简体G和简体U
            const downlaodNodes = childNodes
                .filter((node) => node.nodeName === '#text')
                .filter((node: any) => /简体\((G|U)\)/.test(node.data));
        });
    }
}

export default Spider;
