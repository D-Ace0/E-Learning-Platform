import { join } from 'path';
import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Controller('files')
export class FilesController {
    @Get('course-analytics/:filename')
    getCourseAnalyticsFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = join(UPLOAD_DIR, filename); // Serve from 'uploads' folder
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error serving file:', err);
                res.status(404).send({ message: 'File not found' });
            }
        });
    }
}
