import {
  BadRequestException,
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
import { MfaService } from '../mfa/mfa.service';
import { MailModule } from 'src/mail/mail.module';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mfaService: MfaService  
  ) {}

 
  async login({ email, password, mfaToken }: AuthPayloadDTO) {
    const user = await this.userModel.findOne({ email });

    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) throw new UnauthorizedException('Invalid Credentials');


    if (user.mfa_enabled && !this.mfaService.verifyToken(user.mfa_secret, mfaToken)) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const token = await this.generateUserToken(user._id.toString(), user.role);
    return token;
  }

 
  async enableMFA(email: string) {
    const user = await this.userModel.findOne({ email }); 
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = this.mfaService.generateSecret();
    user.mfa_secret = secret;
    user.mfa_enabled = true;
    await user.save();

   
    await this.mfaService.sendOtpEmail(secret, user.email);

    return { message: 'MFA enabled successfully and OTP sent to email' };
  }


  async disableMFA(user_id: string) {
    const user = await this.userModel.findOne({ user_id }); 
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.mfa_secret = undefined;
    user.mfa_enabled = false;
    await user.save();

    return { message: 'MFA disabled successfully' };
  }


  async signup(signUpDataDTO: SignupDTO) {
    const { email, password, name, role, user_id } = signUpDataDTO;

    const emailInUse = await this.userModel.findOne({ email });
    if (emailInUse) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user_id_InUse = await this.userModel.findOne({ user_id });
    if (user_id_InUse) throw new BadRequestException('User ID is already in use.');

    const createdUser = await this.userModel.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
      user_id,
    });

    createdUser.password_hash = undefined;
    return createdUser;
  }


  async generateUserToken(user_id: string, role: string) {
    const accessToken = await this.jwtService.sign({ user_id, role });
    return { accessToken };
  }

 
}
