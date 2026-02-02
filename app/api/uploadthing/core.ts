import {createUploadthing, type FileRouter} from "uploadthing/next";


const f = createUploadthing();

export const ourFileRouter = {

    serviceImageUploader: f({
        image: {
            maxFileSize: "16MB", maxFileCount: 3
        },
        video: {
            maxFileSize: "64MB", maxFileCount: 1
        }
    })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Archivo subido en:", file.url);
            return { uploadedBy: "Client", url: file.url, type: file.type };
        }),
} satisfies FileRouter;
export type OurFileRouter = typeof  ourFileRouter;