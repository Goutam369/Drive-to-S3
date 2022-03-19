import { Body, Controller, Param, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  async uploadFileToS3(@Body('file') file: string) {
    return await this.uploadsService.upload(file);
  }
}
