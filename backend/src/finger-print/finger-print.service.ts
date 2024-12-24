import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FingerPrintService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>)
    {
    }
    async registerFingerprint(userId: string, fingerprint: string) {
        try {
            console.log(userId,fingerprint);
            // Find user by ID
            const user = await this.userModel.findById(userId).exec();
    
            // Check if user exists
            if (!user) {
                console.error(`User with ID ${userId} not found`);
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
    
            // Check if fingerprint is already registered
            if (user.finger_print) {
                throw new BadRequestException('Fingerprint already registered');
            }
    
          const hashed_FP_id= await bcrypt.hash(fingerprint, 10);
            user.finger_print = hashed_FP_id;
    
            // Save user and handle validation errors
            await user.save();
  
            return { message: 'Fingerprint registered successfully' };
        } catch (err: any) {
            
            return { statusCode: 500, message: 'Something went wrong', error: err.message };
        }
    }
    
    

    async verifyFingerprint(userId: string, fingerprint: string) {
        try {
            const user = await this.userModel.findById(userId).exec();
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
         const isValidFingerprint = await bcrypt.compare(fingerprint, user.finger_print);
         if(!isValidFingerprint){
             return false;
         }
            else{
                return true;
            }
        } catch (err:any) {
            return { statusCode: 500, message: 'Something went wrong', error: err.message };
        }
        
        return false;
    }
}
