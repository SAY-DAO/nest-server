import { NFTStorage, File } from "nft.storage"
import fs, { createWriteStream } from 'fs';
import mime from 'mime'
import https from "https";
import axios from 'axios'

export async function storeImagesIpfs(url: string, name: string, description: string) {
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY })
    const image = await fileFromPath(url, name)
    console.log("ipfs1")

    const cid = await client.storeDirectory([image])
    console.log(cid)

    const data = client.store({
        image,
        name: name,
        description,
    })
    console.log("ipfs2")

    const status = await client.status(cid)
    console.log(status)
    return data
}

export async function fileFromPath(url: string, name = 'noTitle'): Promise<any> {
    try {
        // const icon = fs.createWriteStream(`${name}.jpg`);
        // const request = https.get(
        //     url,
        //     async function (response) {
        //         response.pipe(icon);
        //     }
        // )
        await downloadFile(url, `${name}.jpg`)
        const content = await fs.promises.readFile(`./${name}.jpg`)
        const type = mime.getType(`./${name}.jpg`)
        const file = new File([content], (`${name}`), { type })
        return file
    } catch (e) {
        console.log(e)
    }


}

export async function downloadFile(fileUrl: string, outputLocationPath: string) {
    const writer = createWriteStream(outputLocationPath);
    console.log("ipfs0")

    return axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(response => {

        //ensure that the user can call `then()` only when the file has
        //been downloaded entirely.

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                console.log("err")
                console.log(err)
                error = err;
                // writer.close();
                // reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    console.log("err2")
                    console.log(error)
                    // resolve(true);
                }
                //no need to call the reject here, as it will have been called in the
                //'error' stream;
            });
        });
    });
}

