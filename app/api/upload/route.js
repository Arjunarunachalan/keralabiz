import { writeFile, mkdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No files received.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean up the filename: replace spaces with hyphens
        const filename = Date.now() + '-' + file.name.replaceAll(' ', '-');

        // Ensure the directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Ignore error if directory already exists
            if (err.code !== 'EEXIST') throw err;
        }

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Return public URL
        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
    }
}
