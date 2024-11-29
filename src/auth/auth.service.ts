import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDTO } from './dto/signin';
import { SignupDTO } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { AuthenticationLog, AuthenticationLogDocument } from 'src/schemas//authentication_logs.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MfaService } from '../mfa/mfa.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(AuthenticationLog.name) private authenticationLogModel: Model<AuthenticationLogDocument>,
    private jwtService: JwtService,
    private mfaService: MfaService
  ) {}

  async login({ email, password, mfaToken }: SignInDTO) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      await this.logAuthenticationAttempt(email, 'Login Attempt', 'Failure');
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await this.logAuthenticationAttempt(email, 'Login Attempt', 'Failure');
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (user.mfa_enabled && !this.mfaService.verifyToken(user.mfa_secret, mfaToken)) {
      await this.logAuthenticationAttempt(email, 'Login Attempt', 'Failure');
      throw new UnauthorizedException('Invalid MFA token');
    }

    const token = await this.generateUserToken(user._id, user.role);
    await this.logAuthenticationAttempt(email, 'Login Attempt', 'Success');
    return token;
  }

  async generateUserToken(user_id: mongoose.Types.ObjectId, role: string) {
    const accessToken = await this.jwtService.sign({ user_id, role });
    return { accessToken };
  }

  async enableMFA(user_id: string) {
    const user = await this.userModel.findById(user_id);
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
    const user = await this.userModel.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.mfa_secret = undefined;
    user.mfa_enabled = false;
    await user.save();

    return { message: 'MFA disabled successfully' };
  }

  async signup(signUpDataDTO: SignupDTO) {
    const { email, password, name, role, age } = signUpDataDTO;

    const emailInUse = await this.userModel.findOne({ email });
    if (emailInUse) {
      await this.logAuthenticationAttempt(email, 'Signup Attempt', 'Failure');
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.userModel.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
      age
    });

    createdUser.password_hash = undefined;

    await this.logAuthenticationAttempt(email, 'Signup Attempt', 'Success');

    return createdUser;
  }

  async getCurrentOtp(user_id: string) {
    const user = await this.userModel.findById(user_id);
    if (!user || !user.mfa_enabled || !user.mfa_secret) {
      throw new NotFoundException('User not found or MFA not enabled');
    }

    const otp = this.mfaService.generateCurrentOtp(user.mfa_secret);
    return { otp };
  }

  
  private async logAuthenticationAttempt(email: string, event: string, status: string) {
    const user = await this.userModel.findOne({ email });

    const log = new this.authenticationLogModel({
      user_id: user ? user._id : null,
      event,
      status,
      timestamp: new Date()
    });

    await log.save();
  }
}
