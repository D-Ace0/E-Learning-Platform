import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { SignInDTO } from './dto/signin'
import { SignupDTO } from './dto/signup.dto'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/schemas/user.schema'
import mongoose, { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { MfaService } from '../mfa/mfa.service'
import { Response } from 'express'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mfaService: MfaService  
  ) {}

  async login({ email, password, mfaToken }: SignInDTO, response: Response) {
    const user = await this.userModel.findOne({ email })

    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) throw new UnauthorizedException('Invalid Credentials');


    if (user.mfa_enabled && !this.mfaService.verifyToken(user.mfa_secret, mfaToken)) {
      throw new UnauthorizedException('Invalid MFA token');
    }
    const token = await this.generateUserToken(user._id, user.role)
    // Store token in a cookie
    response.cookie('auth_token', token.accessToken, {
      httpOnly: true, // prevents xss
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return response.status(200).json({ message: 'Login successful' });
  }
  

  async signOut(response: Response) {
    response.clearCookie('auth_token', {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return response.status(200).json({ message: 'Successfully signed out' });
  }
  

  async generateUserToken(user_id: mongoose.Types.ObjectId, role: string) {
    const accessToken = await this.jwtService.sign({ user_id, role })
    return { accessToken }
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
    const { email, password, name, role, age } = signUpDataDTO

    const emailInUse = await this.userModel.findOne({ email });
    if (emailInUse) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.userModel.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
      age
    })
   
    createdUser.password_hash = undefined
    return createdUser
  }

  async getCurrentOtp(user_id: string) {
    const user = await this.userModel.findById(user_id)
    if (!user || !user.mfa_enabled || !user.mfa_secret) {
        throw new NotFoundException('User not found or MFA not enabled')
    }
    
    const otp = this.mfaService.generateCurrentOtp(user.mfa_secret);
    return { otp }
}
}