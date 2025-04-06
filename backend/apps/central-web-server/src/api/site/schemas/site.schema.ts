import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  MonitorDocument,
  MonitorSchema,
} from 'apps/central-web-server/src/api/site/schemas/monitor.schema';
import { ProjectDocument } from 'apps/central-web-server/src/api/project/schemas/project.schema';
import { IIsActive } from 'apps/central-web-server/src/common/types/is-active';
import { ISoftDeletable } from 'apps/central-web-server/src/common/types/soft-deletable';
import mongoose, { Document } from 'mongoose';

@Schema({ _id: false })
export class Setting implements IIsActive {
  @Prop({
    required: true,
    ref: 'Location',
    type: [String],
  })
  locations: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true }) runHours: number[];

  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  frequency: string | number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  lighthouseConfig: any;
}

@Schema({ _id: false })
export class Relations {
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Monitor', default: [] })
  monitors: MonitorDocument[];

  @Prop({
    required: true,
    ref: 'Project',
    type: [mongoose.Schema.Types.ObjectId],
  })
  project: ProjectDocument;
}

const RelationsSchema = SchemaFactory.createForClass(Relations);

const SettingSchema = SchemaFactory.createForClass(Setting);
@Schema()
export class Site implements ISoftDeletable {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: SettingSchema })
  settings: Setting;

  @Prop({ required: true, type: RelationsSchema })
  relations: Relations;

  @Prop()
  deletedAt: Date;

  @Prop({ type: [MonitorSchema], default: [] })
  sites: SiteDocument[];
}

export type SiteDocument = Site & Document;

export const SiteSchema = SchemaFactory.createForClass(Site);
