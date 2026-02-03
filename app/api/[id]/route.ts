import {NextRequest, NextResponse} from "next/server";
import clientPromise from "@/lib/mongodb";
import {ObjectId} from "bson";

export async function GET(
    req: NextRequest,
    {params}: { params: { id: string}}

){
    try{
        const { id} = params;
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const mediaDoc = await db.collection('media_vault').findOne({
            _id: new ObjectId(id)
        });

        if(!mediaDoc) return new NextResponse('Not Found', {status: 404});

        const realUrl = `https://utfs.io/f/${mediaDoc.fileKey}`;

        const response = await fetch(realUrl);
        const arrayBuffer = await response.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': mediaDoc.mimeType ||'image/jpeg',
                'Cache-Control': 'private, max-age=31536000, immutable',
            },
        });
    } catch (e){
        return new NextResponse('error', { status: 500})
    }
}