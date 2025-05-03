import { diskStorage } from 'multer';
import { uuid } from 'uuidv4';
import path from 'path';

export const avatarVoiceStorage = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const destination: string = file.fieldname === 'voiceFile'
        ? './uploads/children/voices'
        : './uploads/children/avatars';
      return cb(null, destination);
    },
    filename: (req, file, cb) => {
      const fileName: string =
        file.fieldname === 'voiceFile'
          ? path.parse(file.originalname).name.replace(/\s/g, '') + uuid()
          : path.parse(file.originalname).name.replace(/\s/g, '') +
          '-s-' +
          uuid();
      const extension: string = path.parse(file.originalname).ext;
      return cb(null, `${fileName}${extension}`);
    },
  }),
};
