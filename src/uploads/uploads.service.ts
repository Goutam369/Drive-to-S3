import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import * as url from 'url';
import * as https from 'https';
import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';
import { response } from 'express';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();
// import { ConfigModule } from '@nestjs/config';

const CLIENT_ID = process.env.CLIENT_ID_GOOGLE;
const CLIENT_SECRET = process.env.CLIENT_SECRET_GOOGLE;

const REDIRECT_URI = process.env.REDIRECT_URI_GOOGLE;

const REFRESH_TOKEN = process.env.REFRESH_TOKEN_GOOGLE;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

@Injectable()
export class UploadsService {
  async upload(f_id: string) {
    const tempFileId = url.parse(f_id, true);
    const tempfid = tempFileId.pathname.toString();

    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    });

    if (tempfid.slice(1, 5) === 'file') {
      const file_id = tempfid.slice(8, 41);

      console.log(file_id);
      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

      try {
        drive.files.get({ fileId: file_id }, (er, re) => {
          if (er) {
            console.log(er);
            return;
          }

          drive.files.get(
            { fileId: file_id, alt: 'media' },
            { responseType: 'stream' },
            function (err, res) {
              const buf = [];
              res.data.on('data', function (e) {
                buf.push(e);
              });
              res.data
                .on('end', () => {
                  console.log('done');

                  const buffer = Buffer.concat(buf);
                  const fileContent = buffer;
                  const ID = process.env.ID_AWS;

                  const SECRET = process.env.SECRET_AWS;

                  const BUCKET_NAME = process.env.BUCKET_NAME_AWS;

                  const s3 = new AWS.S3({
                    accessKeyId: ID,
                    secretAccessKey: SECRET,
                  });

                  const params = {
                    Bucket: BUCKET_NAME,
                    Key: re.data.name, // File name you want to save as in S3
                    Body: fileContent,
                  };

                  s3.upload(params, async function (err, data) {
                    if (err) {
                      throw err;
                    }
                  })
                    .promise()
                    .then(function (data) {
                      console.log(data.Location);
                    });
                })
                .on('error', (err) => {
                  console.log('Error', err);
                });
              // .pipe(dest);
            },
          );
        });
      } catch (error) {
        console.log(error);
      }
    } else if (tempfid.slice(11, 18) === 'folders') {
      // const res = await drive.files.list({
      //   q: "mimeType = 'application/vnd.google-apps.folder'",
      // });
      // for (const file of res.data.files) {
      //   console.log(file);
      //   await this.upload(
      //     'https://drive.google.com/drive/u/2/folders/' + file.id,
      //   );
      // }
      return "It's a Folder";
    } else {
      return 'invalid URL';
    }
  }
}
