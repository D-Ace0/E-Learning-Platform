import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/user/models/user.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  exports: [MongooseModule],
  controllers: [UsersController],

  providers: [UsersService],
})
export class UsersModule {}
