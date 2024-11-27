import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
<<<<<<< Updated upstream
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
=======
} from '@nestjs/common'
import { SignInDTO } from './dto/signin'
import { SignupDTO } from './dto/signup.dto'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/schemas/user.schema'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { MfaService } from '../mfa/mfa.service'

>>>>>>> Stashed changes
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mfaService: MfaService  
  ) {}

<<<<<<< Updated upstream
 
  async login({ email, password, mfaToken }: AuthPayloadDTO) {
    const user = await this.userModel.findOne({ email });
=======
  async login({ email, password, mfaToken }: SignInDTO) {
    const user = await this.userModel.findOne({ email })
>>>>>>> Stashed changes

    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) throw new UnauthorizedException('Invalid Credentials');


    if (user.mfa_enabled && !this.mfaService.verifyToken(user.mfa_secret, mfaToken)) {
      throw new UnauthorizedException('Invalid MFA token');
    }

<<<<<<< Updated upstream
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
=======
    const token = await this.generateUserToken(user._id.toString(), user.role)
       return token
      }
      
  async generateUserToken(user_id: string, role: string) {
    const accessToken = await this.jwtService.sign({ user_id, role })
    return { accessToken }
  }

  async enableMFA(user_id: string) {
    const secret = this.mfaService.generateSecret()
    await this.userModel.findByIdAndUpdate(user_id, {
      mfa_secret: secret, 
        mfa_enabled: true
    });
    return { message: 'MFA enabled successfully' }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    const { email, password, name, role, user_id } = signUpDataDTO;
=======
    const { email, password, name, role, age } = signUpDataDTO
>>>>>>> Stashed changes

    const emailInUse = await this.userModel.findOne({ email });
    if (emailInUse) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);

<<<<<<< Updated upstream
    const user_id_InUse = await this.userModel.findOne({ user_id });
    if (user_id_InUse) throw new BadRequestException('User ID is already in use.');

=======
>>>>>>> Stashed changes
    const createdUser = await this.userModel.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
<<<<<<< Updated upstream
      user_id,
    });

    createdUser.password_hash = undefined;
    return createdUser;
  }


  async generateUserToken(user_id: string, role: string) {
    const accessToken = await this.jwtService.sign({ user_id, role });
    return { accessToken };
  }

 
=======
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
>>>>>>> Stashed changes
}
