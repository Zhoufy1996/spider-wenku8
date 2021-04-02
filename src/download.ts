import http from 'http';
import fs from 'fs';

const download = (url: string, dest: string, charset = 'utf-8') => {
    const file = fs.createWriteStream(dest, charset);
    return new Promise((resolve, reject) => {
        http.get(
            url,
            {
                // 乱码
                headers: { 'Content-Type': `text/plain;charset=${charset}` },
            },
            (res) => {
                res.pipe(file);

                file.on('finish', () => {
                    resolve('');
                });
                file.on('error', (err) => {
                    reject(err);
                });
            }
        );
    });
};

export default download;
