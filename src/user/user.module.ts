import { Module } from '@nestjs/common'
import { UserController } from 'src/user/user.controller'
import { UserService } from 'src/user/user.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/user/models/user.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  exports: [MongooseModule],
  controllers: [UserController],

  providers: [UserService],
})
export class UserModule {}
