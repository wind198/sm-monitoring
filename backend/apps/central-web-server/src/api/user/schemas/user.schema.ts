import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IIsActive } from 'apps/central-web-server/src/common/types/is-active';
import { ISoftDeletable } from 'apps/central-web-server/src/common/types/soft-deletable';
import { Document } from 'mongoose';

export const userTypeList = ['super_admin', 'user', 'developer'] as const;

export type IUserType = (typeof userTypeList)[number];

export const userApiKeyPermissionList = ['read', 'write'] as const;

export type IUserApiKeyPermission = (typeof userApiKeyPermissionList)[number];

export class UserApiKey {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    enum: userApiKeyPermissionList,
    type: [String],
    default: ['read'],
  })
  permission: IUserApiKeyPermission;
}

const UserApiKeySchema = SchemaFactory.createForClass(UserApiKey);

@Schema()
export class User implements ISoftDeletable, IIsActive {
  @Prop() deletedAt: Date;

  @Prop({ default: false }) isActive: boolean;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop() fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: userTypeList, type: String })
  type: IUserType;

  @Prop({ type: [UserApiKeySchema], default: [] })
  apiKeys: UserApiKey[];

  @Prop()
  activationKey: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
