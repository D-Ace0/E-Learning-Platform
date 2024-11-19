// import { Test, TestingModule } from '@nestjs/testing';
// import { getModelToken } from '@nestjs/mongoose';

// import { User } from '../schemas/user.schema';
// import { Model } from 'mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import * as mongoose from 'mongoose';
// import { UsersService } from './users.service';

// describe('UsersService', () => {
//   let service: UsersService;
//   let mongod: MongoMemoryServer;
//   let userModel: Model<User>;

//   beforeAll(async () => {
//     mongod = new MongoMemoryServer();
//     const uri = await mongod.getUri();

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UsersService,
//         {
//           provide: getModelToken('User'),
//           useValue: mongoose.model('User', new mongoose.Schema({
//             user_id: String,
//             name: String,
//             email: String,
//             password_hash: String,
//             role: String,
//             profile_picture_url: String,
//             created_at: Date,
//           })),
//         },
//       ],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//     userModel = module.get<Model<User>>(getModelToken('User'));

//     await mongoose.connect(uri);
//   });

//   afterAll(async () => {
//     await mongoose.disconnect();
//     await mongod.stop();
//   });

//   afterEach(async () => {
//     await userModel.deleteMany({});
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('should create a user', async () => {
//     const user = {
//       user_id: '1',
//       name: 'John Doe',
//       email: 'john.doe@example.com',
//       password_hash: 'passwordHash1',
//       role: 'student',
//       profile_picture_url: 'http://example.com/profile1.jpg',
//       created_at: new Date(),
//     };

//     const createdUser = new userModel(user);
//     await createdUser.save();

//     const foundUser = await service.findAll();
//     expect(foundUser.length).toBe(1);
//     expect(foundUser[0].name).toBe(user.name);
//   });

//   it('should fetch all users', async () => {
//     const users = [
//       { user_id: '1', name: 'John Doe', email: 'john.doe@example.com', password_hash: 'passwordHash1', role: 'student', profile_picture_url: 'http://example.com/profile1.jpg', created_at: new Date() },
//       { user_id: '2', name: 'Jane Doe', email: 'jane.doe@example.com', password_hash: 'passwordHash2', role: 'instructor', profile_picture_url: 'http://example.com/profile2.jpg', created_at: new Date() },
//     ];

//     await userModel.insertMany(users);

//     const foundUsers = await service.findAll();
//     expect(foundUsers.length).toBe(2);
//     expect(foundUsers[0].name).toBe(users[0].name);
//     expect(foundUsers[1].name).toBe(users[1].name);
//   });

//   it('should find a user by id', async () => {
//     const user = {
//       user_id: '1',
//       name: 'John Doe',
//       email: 'john.doe@example.com',
//       password_hash: 'passwordHash1',
//       role: 'student',
//       profile_picture_url: 'http://example.com/profile1.jpg',
//       created_at: new Date(),
//     };

//     const createdUser = new userModel(user);
//     await createdUser.save();

//     const foundUser = await service.getProfile(createdUser._id.toString());
//     expect(foundUser).toBeDefined();
//     expect(foundUser.name).toBe(user.name);
//   });
// });
