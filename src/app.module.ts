import { Module } from '@nestjs/common';
import { UploadsModule } from './uploads/uploads.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UploadsModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
