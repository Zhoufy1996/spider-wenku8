import express from 'express';
import open from 'open';

const app = express();

const port = 8000;

app.get('/', (req, res) => {
    res.send('hello word');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    open(`http://localhost:${port}`);
});
