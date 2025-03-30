import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SiteDocument } from 'apps/central-web-server/src/api/site/schemas/site.schema';
import { UserDocument } from 'apps/central-web-server/src/api/user/schemas/user.schema';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Project {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) code: string;

  @Prop({
    required: true,
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'Site',
    default: [],
  })
  sites: SiteDocument[];

  @Prop({
    required: true,
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'User',
    default: [],
  })
  admins: UserDocument;

  @Prop({
    required: true,
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'User',
    default: [],
  })
  members: UserDocument;
}

export type ProjectDocument = Project & Document;

export const ProjectSchema = SchemaFactory.createForClass(Project);
