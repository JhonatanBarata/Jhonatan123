// Project-wide ambient types
declare module 'multer' {
  const content: any;
  export default content;
}

declare global {
  namespace Express {
    interface Request {
      // multer adds `file` for single uploads and `files` for multiple
      file?: any;
      files?: any;
    }
  }
}

export {};
