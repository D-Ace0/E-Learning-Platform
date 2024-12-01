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
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MfaService } from '../mfa/mfa.service';
import { AuthenticationLog, AuthenticationLogDocument, AuthenticationStatus } from 'src/schemas/authentication_logs.schema';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(AuthenticationLog.name) private authLogModel: Model<AuthenticationLogDocument>,
    private jwtService: JwtService,
    private mfaService: MfaService  
  ) {}

  async login({ email, password, mfaToken }: SignInDTO) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      await this.logAuthenticationAttempt(email, 'Login Attempt', AuthenticationStatus.FAILURE);
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await this.logAuthenticationAttempt(email, 'Login Attempt', AuthenticationStatus.FAILURE);
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (user.mfa_enabled && !this.mfaService.verifyToken(user.mfa_secret, mfaToken)) {
      await this.logAuthenticationAttempt(email, 'Login Attempt', AuthenticationStatus.FAILURE);
      throw new UnauthorizedException('Invalid MFA token');
    }

    const token = await this.generateUserToken(user._id, user.role);
    await this.logAuthenticationAttempt(email, 'Login Attempt', AuthenticationStatus.SUCCESS);  // Success log for login
    return { message: 'Login successful', token };
  }

  async signOut(response: Response) {
    response.clearCookie('auth_token', {
      httpOnly: true,  // prevents XSS
      sameSite: 'strict',  // CSRF protection
    });
    await this.logAuthenticationAttempt('N/A', 'Sign Out', AuthenticationStatus.SUCCESS);  
    return response.status(200).json({ message: 'Successfully signed out' });
  }

  async generateUserToken(user_id: mongoose.Types.ObjectId, role: string) {
    const accessToken = await this.jwtService.sign({ user_id, role });
    return { accessToken };
  }

  async enableMFA(user_id: string) {
    const user = await this.userModel.findById(user_id); 
    if (!user) {
      await this.logAuthenticationAttempt(user_id, 'Enable MFA', AuthenticationStatus.FAILURE); 
      throw new NotFoundException('User not found');
    }

    const secret = this.mfaService.generateSecret();
    user.mfa_secret = secret;
    user.mfa_enabled = true;
    await user.save();

    await this.mfaService.sendOtpEmail(secret, user.email);

    await this.logAuthenticationAttempt(user_id, 'Enable MFA', AuthenticationStatus.SUCCESS);  
    return { message: 'MFA enabled successfully and OTP sent to email' };
  }

  async disableMFA(user_id: string) {
    const user = await this.userModel.findById(user_id); 
    if (!user) {
      await this.logAuthenticationAttempt(user_id, 'Disable MFA', AuthenticationStatus.FAILURE); 
      throw new NotFoundException('User not found');
    }

    user.mfa_secret = undefined;
    user.mfa_enabled = false;
    await user.save();

    await this.logAuthenticationAttempt(user_id, 'Disable MFA', AuthenticationStatus.SUCCESS);  
    return { message: 'MFA disabled successfully' };
  }

  async signup(signUpDataDTO: SignupDTO) {
    const { email, password, name, role, age } = signUpDataDTO;

    const emailInUse = await this.userModel.findOne({ email });
    if (emailInUse) {
      await this.logAuthenticationAttempt(email, 'Signup Attempt', AuthenticationStatus.FAILURE);  
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.userModel.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
      age,
    });

    createdUser.password_hash = undefined;

    await this.logAuthenticationAttempt(email, 'Signup Attempt', AuthenticationStatus.SUCCESS);  
    return { message: 'Signup successful', user: createdUser };
  }

  private async logAuthenticationAttempt(email: string, event: string, status: AuthenticationStatus) {
    const log = new this.authLogModel({
      user_id: email, 
      event,
      status,
      timestamp: new Date(),
    });
    await log.save();
  }
}
