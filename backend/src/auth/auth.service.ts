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

  async login({ email, password, mfaToken }: SignInDTO, response: Response) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      await this.logAuthenticationAttempt(null, email, 'Login', AuthenticationStatus.FAILURE, 'User not found');
      throw new NotFoundException('User not found');
    }

    if (!user.password_hash) {
      await this.logAuthenticationAttempt(user._id, email, 'Login', AuthenticationStatus.FAILURE, 'Password hash not found');
      throw new UnauthorizedException('Password not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await this.logAuthenticationAttempt(user._id, email, 'Login', AuthenticationStatus.FAILURE, 'Invalid Credentials');
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (user.mfa_enabled) {
      if (!mfaToken) {
        const otp = this.mfaService.generateCurrentOtp(user.mfa_secret);
        await this.mfaService.sendOtpEmail(user.mfa_secret, user.email, user);
        await this.logAuthenticationAttempt(user._id, email, 'MFA', AuthenticationStatus.PENDING_MFA, 'MFA token sent to email');
        return response.status(202).json({
          message: 'MFA token sent to your email. Please provide the MFA token to complete the login process.',
        });
      }

      try {
        this.mfaService.verifyToken(user.mfa_secret, mfaToken);
      } catch (error) {
        await this.logAuthenticationAttempt(user._id, email, 'MFA', AuthenticationStatus.FAILURE, 'Invalid MFA token');
        throw new UnauthorizedException('Invalid MFA token');
      }
    }

    const token = await this.generateUserToken(user._id, user.role, user.name);

    response.cookie('auth_token', token.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await this.logAuthenticationAttempt(user._id, email, 'Login', AuthenticationStatus.SUCCESS, 'Login successful');
    return response.status(200).json({ message: 'Login successful' });
  }



  // Sign-out method
  async signOut(response: Response) {
    response.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict' });
    await this.logAuthenticationAttempt(null, 'N/A', 'Sign Out', AuthenticationStatus.SUCCESS, 'Signed out successfully');
    return response.status(200).json({ message: 'Successfully signed out' });
  }

  // Generate JWT token
  async generateUserToken(user_id: mongoose.Types.ObjectId, role: string, name: string) {
    const accessToken = await this.jwtService.sign({ user_id, role, name });
    return { accessToken };
  }

  // Enable MFA
  async enableMFA(user_id: string) {
    const user = await this.userModel.findById(user_id);
    if (!user) {
      await this.logAuthenticationAttempt(new mongoose.Types.ObjectId(user_id), user?.email || 'N/A', 'Enable MFA', AuthenticationStatus.FAILURE, 'User not found');
      throw new NotFoundException('User not found');
    }

    const secret = this.mfaService.generateSecret();
    user.mfa_secret = secret;
    user.mfa_enabled = true;
    await user.save();

    await this.mfaService.sendOtpEmail(secret, user.email, user);

    await this.logAuthenticationAttempt(new mongoose.Types.ObjectId(user_id), user.email, 'Enable MFA', AuthenticationStatus.SUCCESS, 'MFA enabled successfully');
    return { message: 'MFA enabled successfully and OTP sent to email' };
  }

  // Disable MFA
  async disableMFA(user_id: string) {
    const user = await this.userModel.findById(user_id);
    if (!user) {
      await this.logAuthenticationAttempt(new mongoose.Types.ObjectId(user_id), user?.email || 'N/A', 'Disable MFA', AuthenticationStatus.FAILURE, 'User not found');
      throw new NotFoundException('User not found');
    }

    user.mfa_secret = undefined;
    user.mfa_enabled = false;
    await user.save();

    await this.logAuthenticationAttempt(new mongoose.Types.ObjectId(user_id), user.email, 'Disable MFA', AuthenticationStatus.SUCCESS, 'MFA disabled successfully');
    return { message: 'MFA disabled successfully' };
  }

  // Signup method
  async signup(signUpDataDTO: SignupDTO) {
    const { email, password, name, role, age } = signUpDataDTO;

    const emailInUse = await this.userModel.findOne({ email });
    if (emailInUse) {
      await this.logAuthenticationAttempt(null, email, 'Signup Attempt', AuthenticationStatus.FAILURE, 'Email already in use');
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

    await this.logAuthenticationAttempt(createdUser._id, email, 'Signup Attempt', AuthenticationStatus.SUCCESS, 'Signup successful');
    return { message: 'Signup successful', user: createdUser };
  }

  // Log authentication attempts
  private async logAuthenticationAttempt(user_id: mongoose.Types.ObjectId | null, email: string, event: string, status: AuthenticationStatus, message: string) {
    const log = new this.authLogModel({
      user_id,  
      email,
      event,
      status,
      message,
      timestamp: new Date(),
    });
    await log.save();
  }
}
