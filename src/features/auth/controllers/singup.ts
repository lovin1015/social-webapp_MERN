import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schema/signup';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { uploads } from '@global/helpers/cloudinary-uploads';
import { BadRequestError } from '@global/helpers/error-helpers';
import { Helpers } from '@global/helpers/helpers';
import { authService } from '@service/db/auth.service';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { ObjectId } from 'mongodb';

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
    return res
      .status(httpStatus.CREATED)
      .json({ message: 'User created successfully', authData });
  }
  private signupData(data: ISignUpData) {
    const {} = data;
    return {
      ...data,
      username: Helpers.firstLetterUppercase(data.username),
      email: Helpers.firstLetterUppercase(data.email),
      createdAt: new Date(),
    } as unknown as IAuthDocument;
  }
}
