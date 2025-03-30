import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MonitorDocument } from 'apps/central-web-server/src/api/monitor/schemas/monitor.schema';
import { ILighthouseScores } from 'libs/types/src/check';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
class Timing {
  @Prop({ required: true }) queuedAt: Date;
  @Prop({ required: true }) runAt: Date;
}

const TimingSchema = SchemaFactory.createForClass(Timing);

@Schema({ _id: false })
class Relation {
  @Prop({ required: true, type: mongoose.SchemaTypes.ObjectId, ref: 'Monitor' })
  monitor: MonitorDocument;
}

const RelationSchema = SchemaFactory.createForClass(Relation);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Check {
  @Prop({ required: true, select: false, type: Buffer })
  testResult: Buffer;

  @Prop({ required: true, type: RelationSchema }) relations: Relation;

  @Prop({ required: true, type: TimingSchema })
  timing: Timing;

  @Prop({ required: true, type: mongoose.SchemaTypes.Mixed })
  scores: ILighthouseScores;
}

export type CheckDocument = HydratedDocument<Check>;

export const CheckSchema = SchemaFactory.createForClass(Check);

CheckSchema.index({ monitor: 1 });
