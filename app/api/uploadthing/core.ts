import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  coverImage: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(({ file }) => {
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
