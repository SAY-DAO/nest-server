import { diskStorage } from 'multer';
import { uuid } from 'uuidv4';
import path from 'path';

export const providerStorage = {
    storage: diskStorage({
        destination: './uploads/providers/logos',
        filename: (req, file, cb) => {
            const fileName: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuid() // unique id
            const extension: string = path.parse(file.originalname).ext
            return cb(null, `${fileName}${extension}`)
        }
    })
}