const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const upload = multer({ dest: '/tmp' });
const app = express();
const port = 3000;

app.post('/upload', upload.array('file'), async (req, res) => {
  const urls = [];
  for (const file of req.files) {
    const rand = crypto.randomBytes(3).toString('hex'); // sfd1f 样式
    const filename = `${rand}_${file.originalname}`;
    const targetPath = `img1/${filename}`;
    fs.renameSync(file.path, `/tmp/${filename}`);

    // 将图片推送到 GitHub（通过 GitHub Actions 处理）
    fs.writeFileSync(`/tmp/trigger.txt`, `upload:${filename}`);
    exec(`gh workflow run upload.yml -f filename="${filename}"`, {
      env: {
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      },
    });

    urls.push(`https://img1.keaeye.fun/${filename}`);
  }
  res.json({ success: true, urls });
});

app.listen(port, () => {
  console.log(`Uploader server at http://localhost:${port}`);
});
