import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { IHasFindNonDeleted } from 'apps/central-web-server/src/common/types/has-find-non-deleted';

@Injectable()
export class UserService implements IHasFindNonDeleted<User> {
  constructor(@InjectModel(User.name) public userModel: Model<User>) {}

  findNonDeleted() {
    return this.userModel.where({ deletedAt: null });
  }
}
