import {NextRequest, NextResponse} from "next/server";
import clientPromise from "@/lib/mongodb";
import {ObjectId} from "bson";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
){
    try{
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id || !ObjectId.isValid(id)) {
            return new NextResponse('Invalid ID', { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const mediaDoc = await db.collection('media_vault').findOne({
            _id: new ObjectId(id)
        });

        if (!mediaDoc) return new NextResponse('Not Found', { status: 404 });

        const realUrl = `https://utfs.io/f/${mediaDoc.fileKey}`;
        const response = await fetch(realUrl);

        if (!response.ok) throw new Error('Fetch failed');

        const arrayBuffer = await response.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': mediaDoc.mimeType || 'image/jpeg',
                'Cache-Control': 'private, max-age=31536000, immutable',
            },
        });
    } catch (e) {
        console.error("API Route Error:", e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}