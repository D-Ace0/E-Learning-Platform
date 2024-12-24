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
          requiresMfa: true
        });
      }

      try {
        const isValidToken = this.mfaService.verifyToken(user.mfa_secret, mfaToken, user._id.toString());
        if (!isValidToken) {
          await this.logAuthenticationAttempt(user._id, email, 'MFA', AuthenticationStatus.FAILURE, 'Invalid MFA token');
          throw new UnauthorizedException('Invalid MFA token');
        }
      } catch (error) {
        await this.logAuthenticationAttempt(user._id, email, 'MFA', AuthenticationStatus.FAILURE, error.message || 'MFA verification failed');
        throw error;
      }
    }

    const token = await this.generateUserToken(user._id, user.role, user.name);

    response.cookie('auth_token', token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await this.logAuthenticationAttempt(user._id, email, 'Login', AuthenticationStatus.SUCCESS, 'Login successful');
    return response.status(200).json({ 
      message: 'Login successful', 
      token: token.accessToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        mfa_enabled: user.mfa_enabled
      }
    });
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

  async verifyMFA(user_id: string, code: string) {
    const user = await this.userModel.findById(user_id);
    if (!user) {
      await this.logAuthenticationAttempt(null, 'N/A', 'Verify MFA', AuthenticationStatus.FAILURE, 'User not found');
      throw new NotFoundException('User not found');
    }

    if (!user.mfa_secret) {
      await this.logAuthenticationAttempt(user._id, user.email, 'Verify MFA', AuthenticationStatus.FAILURE, 'MFA not enabled');
      throw new BadRequestException('MFA not enabled');
    }

    try {
      const isValid = this.mfaService.verifyToken(user.mfa_secret, code, user_id.toString());
      if (isValid) {
        user.mfa_enabled = true;
        await user.save();
        await this.logAuthenticationAttempt(user._id, user.email, 'Verify MFA', AuthenticationStatus.SUCCESS, 'MFA verified successfully');
        return { message: 'MFA verified and enabled successfully' };
      }
    } catch (error) {
      await this.logAuthenticationAttempt(user._id, user.email, 'Verify MFA', AuthenticationStatus.FAILURE, error.message || 'Invalid MFA code');
      throw error;
    }
  }

  // Signup method
  async signup(signUpDataDTO: SignupDTO) {
    const { email, password, name, role, age } = signUpDataDTO;

    try {
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
        created_at: new Date(),
        courses: [],
        mfa_enabled: false
      });

      // Remove sensitive data before returning
      const userResponse = {
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        age: createdUser.age,
        created_at: createdUser.created_at
      };

      await this.logAuthenticationAttempt(createdUser._id, email, 'Signup Attempt', AuthenticationStatus.SUCCESS, 'Signup successful');
      return { message: 'Signup successful', user: userResponse };
    } catch (error) {
      // If it's not our custom error, it's an unexpected error
      if (!(error instanceof BadRequestException)) {
        console.error('Signup error:', error);
        throw new BadRequestException('An error occurred during signup. Please try again.');
      }
      throw error;
    }
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

  async getAuthenticationLogs(user_id: string) {
    const user = await this.userModel.findById(user_id);
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can view authentication logs');
    }

    // Get all logs, sorted by timestamp in descending order
    const logs = await this.authLogModel
      .find()
      .sort({ timestamp: -1 })
      .populate('user_id', 'name email')  // Populate user details if available
      .exec();

    return logs;
  }

  async getUserAuthenticationLogs(adminUserId: string, targetUserId: string) {
    const user = await this.userModel.findById(adminUserId);
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can view authentication logs');
    }

    // Get all logs for the specific user, sorted by timestamp in descending order
    const logs = await this.authLogModel
      .find({ user_id: targetUserId })
      .sort({ timestamp: -1 })
      .populate('user_id', 'name email')
      .exec();

    return logs;
  }
}
