import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { IHasFindNonDeleted } from 'apps/central-web-server/src/common/types/has-find-non-deleted';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  randomActivationKey,
  randomPassword,
} from '../../common/helpers/randomizers';
import { isEmpty, merge } from 'lodash';
import { hash } from 'bcrypt';
import {
  DEFAULT_SUPER_USER_EMAIL,
  DEFAULT_SUPER_USER_PASSWORD,
} from 'libs/constants/src/envs';

@Injectable()
export class UserService implements IHasFindNonDeleted {
  constructor(@InjectModel(User.name) public userModel: Model<User>) {}

  findNonDeleted() {
    return this.userModel.where({ deletedAt: null });
  }

  buildFullname(data: CreateUserDto) {
    const { firstName, lastName } = data;
    return [firstName, lastName].filter(Boolean).join(' ').trim();
  }

  async createUser(data: CreateUserDto) {
    const email = data.email;
    const duplicatedCount = await this.findNonDeleted().countDocuments({
      email,
    });
    if (duplicatedCount > 0) {
      throw new BadRequestException('Email already exists');
    }
    const fullName = this.buildFullname(data);
    if (isEmpty(fullName)) {
      throw new BadRequestException('Invalid first or last name');
    }
    const password = randomPassword();

    const hashedPassword = await hash(password, 10);
    const user = await this.userModel.create(
      merge(data, { fullName, password: hashedPassword }),
    );
    void this.sendUserActionEmail(user);
    return user;
  }

  async sendUserActionEmail(user: UserDocument) {
    const activationKey = randomActivationKey();
    await this.userModel.findByIdAndUpdate(user._id, {
      activationKey,
    });
    //TODO: Send email
  }

  async mockSuperUser() {
    return this.userModel.create({
      email: DEFAULT_SUPER_USER_EMAIL,
      password: await hash(DEFAULT_SUPER_USER_PASSWORD, 10),
      fullName: 'Super User',
      firstName: 'Super',
      lastName: 'User',
      type: 'super_admin',
      isActive: true,
    });
  }
}
