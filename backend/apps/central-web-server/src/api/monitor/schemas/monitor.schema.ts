import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LocationDocument } from 'apps/central-web-server/src/api/location/schemas/location.schema';
import { IIsActive } from 'apps/central-web-server/src/common/types/is-active';
import mongoose, { HydratedDocument } from 'mongoose';

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

  @Prop()
  deletedAt?: Date;
}

const SettingSchema = SchemaFactory.createForClass(Setting);

class Metadata {
  @Prop({
    required: true,
    ref: 'Location',
    type: String,
    refPath: 'code',
  })
  lastCheckedAtLocation: LocationDocument;
}

const MetadataSchema = SchemaFactory.createForClass(Metadata);

@Schema()
export class Monitor {
  @Prop({ required: true }) url: string;

  @Prop({ required: true }) name: string;

  @Prop({ type: SettingSchema, required: true }) settings: Setting;

  @Prop({ type: MetadataSchema }) metadata: Setting;
}

export type MonitorDocument = HydratedDocument<Monitor>;

export const MonitorSchema = SchemaFactory.createForClass(Monitor);

MonitorSchema.index({
  'settings.deletedAt': 1,
  'settings.isActive': 1,
  'settings.runHours': 1,
});
MonitorSchema.index({ 'settings.locations': 1 });
