import * as path from 'path';

export const CSVFileFilter = (req, file, callback) => {

  const ext = path.extname(file.originalname);

  if (ext !== '.csv') {
    req.fileValidationError = 'Invalid file type';
    return callback(new Error('Invalid file type'), false);
  }

  return callback(null, true);

}