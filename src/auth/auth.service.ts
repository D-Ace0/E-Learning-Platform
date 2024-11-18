import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPayloadDTO } from './dto/auth.dto';
import { SignupDTO } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signUpDataDTO: SignupDTO) {
    const { email, password, name, role, user_id } = signUpDataDTO;

    const emailInUse = await this.userModel.findOne({ email: email });

    if (emailInUse) throw new BadRequestException('Email already in use');

    const password_hash = await bcrypt.hash(password, 10);

    const user_id_InUse = await this.userModel.findOne({ user_id: user_id });
    if (user_id_InUse)
      throw new BadRequestException('Userid is already in use.');

    const createdUser = await this.userModel.create({
      name,
      email,
      password_hash,
      role,
      user_id,
    });

    const userWithoutPassword = createdUser.toObject();

    // Ensure password_hash is removed from the response
    const { password_hash: _, ...userWithoutPasswordHash } =
      userWithoutPassword;

    return userWithoutPasswordHash;
  }

  async login({ email, password }: AuthPayloadDTO) {
    const user = await this.userModel.findOne({ email: email });

    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword)
      throw new UnauthorizedException('Invalid Credentials');

    const token = await this.generateUserToken(user._id, user.role);
    return token;
  }

  async generateUserToken(UserId, role) {
    const accessToken = await this.jwtService.sign({ UserId, role });

    return {
      accessToken,
    };
  }
}
