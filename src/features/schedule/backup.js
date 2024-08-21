import { execute } from "@getvim/execute";
import 'dotenv/config';

console.log('Backing up data base using ~.pgpass file...');

// getting db connection parameters from environment file
const username = process.env.DB_FLASK_USER;
const database = process.env.DB_FLASK_NAME;
const dbHost = process.env.DB_FLASK_HOST;
const dbPort = process.env.DB_FLASK_PORT;

// defining backup file name
const date = new Date();
const today = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const backupFile = `../../backup/flask/pg-flask-backup-${today}.tar`;

// writing postgresql backup function
const takePGBackup = () => {
    execute(
        `pg_dump -U ${username} -h ${dbHost} -p ${dbPort} -f ${backupFile} -F t -d ${database} -v`,
    ).then(async () => {
        console.log(`Backup created successfully`);
    }).catch((err) => {
        console.log(err);
    });
};

const getListOfFiles = () => {
    execute(
        `pg_restore -l -f list.toc db.dump`,
    ).then(async () => {
        console.log(`Backup created successfully`);
    }).catch((err) => {
        console.log(err);
    });
};

function sendToBackupServer(fileName = fileNameGzip) {
    const form = new FormData();
    form.append('file', fileName);
    axios.post('', form, { headers: form.getHeaders(), }).then(result => {
        // Handle result…
        fs.unlinkSync(fileNameGzip);
        console.log(result.data);
    }).catch(err => {
        console.error(err);
    });
}


// First, get the TOC list of objects to be restored:
// getListOfFiles();

// calling postgresql backup function
takePGBackup();
