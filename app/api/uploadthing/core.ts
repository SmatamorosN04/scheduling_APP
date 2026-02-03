import {createUploadthing, type FileRouter} from "uploadthing/next";
import clientPromise from "@/lib/mongodb";


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
        .onUploadComplete(async ({ file }) => {
            try {
                const client = await clientPromise
                const db = client.db('scheduling_App');

                const mediaEntry = await db.collection('media_vault').insertOne({
                    fileKey: file.key,
                    mimeType: file.type,
                    name: file.name,
                    size: file.size,
                    uploadedAt: new Date()
                })

                return{
                    internalId: mediaEntry.insertedId.toString(),
                    type: file.type
                }

            } catch (error){
                throw new Error('failed saving the media ')
            }
        }),
} satisfies FileRouter;
export type OurFileRouter = typeof  ourFileRouter;