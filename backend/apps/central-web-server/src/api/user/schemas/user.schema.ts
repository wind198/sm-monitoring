import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IIsActive } from 'apps/central-web-server/src/common/types/is-active';
import { ISoftDeletable } from 'apps/central-web-server/src/common/types/soft-deletable';
import { IS_DEV } from 'libs/constants/src/envs';
import { Document } from 'mongoose';

export const userTypeList = ['super_admin', 'user', 'developer'] as const;

export type IUserType = (typeof userTypeList)[number];

@Schema()
export class User implements ISoftDeletable, IIsActive {
  @Prop() deletedAt: Date;

  @Prop({ default: IS_DEV }) isActive: boolean;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop() fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: userTypeList })
  type: IUserType;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
