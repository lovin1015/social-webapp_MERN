import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schema/signup';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { uploads } from '@global/helpers/cloudinary-uploads';
import { BadRequestError } from '@global/helpers/error-helpers';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { authQueue } from '@service/queues/auth.queue';
import { userQueue } from '@service/queues/user.queue';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { omit } from 'lodash';
import { ObjectId } from 'mongodb';

const userCache: UserCache = new UserCache();
export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<Response> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkUserExistane: IAuthDocument =
      await authService.getUserByUsernameOrEmail(username, email);
    if (checkUserExistane) {
      throw new BadRequestError('Invalid Credentials');
    }
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor,
    });
    const result: UploadApiResponse = (await uploads(
      avatarImage,
      `${userObjectId}`,
      true,
      true
    )) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('file upload error.');
    }
    // add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(
      authData,
      userObjectId
    );
    userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);
    omit(userDataForCache, [
      'uId',
      'username',
      'password',
      'email',
      'avatarColor',
    ]);
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });
    const token = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: token };
    return res.status(httpStatus.CREATED).json({
      message: 'User created successfully',
      user: userDataForCache,
      token,
    });
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor,
      },
      config.JWT_TOKEN!
    );
  }

  private signupData(data: ISignUpData) {
    const {} = data;
    return {
      ...data,
      username: Helpers.firstLetterUppercase(data.username),
      email: data.email,
      createdAt: new Date(),
    } as unknown as IAuthDocument;
  }
  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true,
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
    } as unknown as IUserDocument;
  }
}
