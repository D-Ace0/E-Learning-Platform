import { Module } from '@nestjs/common'
import { AdminController } from 'src/admin/admin.controller'
import { AdminService } from 'src/admin/admin.service'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminSchema } from 'src/admin/models/admin.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }])],
  exports: [MongooseModule],
  controllers: [AdminController],

  providers: [AdminService],
})
export class AdminModule {}
