import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import config from './config.json';
import download from './download';

const downloadPath = path.join(__dirname, '../dist');

interface SpiderProps {
    devtools?: boolean;
    maxDownloadCount?: number;
    downloadPath?: string;
}

interface LoginProps {
    username: string;
    password: string;
}

interface DownloadInfo {
    urls: string[];
    id: number;
    name: string;
}

class Spider {
    private devtools: boolean;

    private browser: puppeteer.Browser | undefined;

    private browserPage: puppeteer.Page | undefined;

    private page: number = 1;

    private shouldDownloadIds: number[] = [];

    private downloadInfo: DownloadInfo[] = [];

    private maxDownloadCount: number;

    private cureentDownloadCount: number = 0;

    private downloadPath: string;

    private hasQueryAllIds: boolean = false;

    constructor(props?: SpiderProps) {
        this.devtools = props?.devtools || false;
        this.maxDownloadCount = props?.maxDownloadCount || 2;
        this.downloadPath = props?.downloadPath || downloadPath;
    }

    async startup() {
        await this.createDownloadDir();
        await this.createBrowser();
        await this.login();
        this.getShouldDownloadIds();
        this.getDownloadInfo();
        this.download();
    }

    async createBrowser() {
        this.browser = await puppeteer.launch({
            devtools: this.devtools,
        });
    }

    async createPage() {
        return this.browser?.newPage();
    }

    async createDownloadDir() {
        if (!fs.existsSync(this.downloadPath)) {
            fs.mkdirSync(this.downloadPath);
        }
    }

    async login() {
        const newPage = await this.createPage();

        await newPage?.goto('https://www.wenku8.net/login.php', { waitUntil: 'networkidle2' });
        this.browserPage?.evaluate((context: LoginProps) => {
            const inputs = document.querySelectorAll('input');
            inputs[0].value = context.username;
            inputs[1].value = context.password;
            inputs[inputs.length - 1].click();
        }, config);

        await newPage?.waitForNavigation();
        await newPage?.close();
    }

    async getShouldDownloadIds() {
        const newPage = await this.createPage();

        await newPage?.goto(`https://www.wenku8.net/modules/article/articlelist.php?page=${this.page}`, {
            waitUntil: 'networkidle2',
        });

        const ids = await newPage?.evaluate(() => {
            const content = document.querySelector('#content');
            if (content) {
                const novelLinks = content.querySelectorAll<HTMLAnchorElement>('b > a');
                return Array.from(novelLinks)
                    .map((node) => {
                        const arr = /\/([0-9]*).htm/.exec(node.href);
                        if (arr) {
                            return Number(arr[1]);
                        }
                        return -1;
                    })
                    .filter((id) => id !== -1);
            }
            return [];
        });

        if (ids) {
            this.shouldDownloadIds.push(...ids);
        }
        await newPage?.close();
        await this.getShouldDownloadIds();
    }

    async getDownloadInfo() {
        const newPage = await this.createPage();
        const id = this.shouldDownloadIds.shift();
        await newPage?.goto(`https://www.wenku8.net/modules/article/packshow.php?id=${id}&type=txtfull`);
        if (id) {
            const downloadInfo: DownloadInfo | undefined = await newPage?.evaluate(() => {
                const doms = document.querySelectorAll('.even');
                if (doms.length > 0) {
                    const downloadsUrl = doms[doms.length - 1];
                    // 简体G和简体U
                    const downlaodNodes = downloadsUrl.querySelectorAll('a');
                    const urls = Array.from(downlaodNodes)
                        .map((node) => node.href)
                        .filter((href) => /fname/.test(href))
                        .slice(1);
                    const infoDom = document.querySelector<HTMLAnchorElement>('caption > a');
                    const arr = /\/([0-9]*)\.htm/.exec(infoDom?.href || '');
                    return {
                        name: infoDom?.innerHTML || '',
                        id: Number((arr && arr[1]) || new Date().getTime()),
                        urls,
                    };
                }

                return undefined;
            });
            if (downloadInfo) {
                this.downloadInfo.push(downloadInfo);
            }
        }

        await newPage?.close();
        this.getDownloadInfo();
    }

    async download() {
        if (this.cureentDownloadCount < this.maxDownloadCount && this.downloadInfo.length > 0) {
            const { urls, id, name } = this.downloadInfo.shift() as DownloadInfo;
            try {
                this.cureentDownloadCount += 1;
                await this.downloadFile(urls, `${id} ${name}`);
            } finally {
                this.cureentDownloadCount -= 1;
                this.download();
            }
        } else {
            setTimeout(() => {
                this.download();
            }, 2000);
        }
    }

    async downloadFile(urls: string[], fileName: string) {
        if (urls.length > 0) {
            try {
                const url = urls[0];

                await download(url, `${path.join(downloadPath, `${fileName}.txt`)}`);
            } catch (e) {
                this.downloadFile(urls.slice(1), fileName);
            }
        }
    }
}

export default Spider;
