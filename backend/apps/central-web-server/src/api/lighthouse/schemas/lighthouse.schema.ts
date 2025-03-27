import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MonitorDocument } from 'apps/central-web-server/src/api/monitor/schemas/monitor.schema';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema()
class Timing {
  @Prop({ required: true }) queuedAt: Date;
  @Prop({ required: true }) runAt: Date;
}

const TimingSchema = SchemaFactory.createForClass(Timing);

@Schema()
class Relation {
  @Prop({ required: true, type: mongoose.SchemaTypes.ObjectId, ref: 'Monitor' })
  monitor: MonitorDocument;
}

const RelationSchema = SchemaFactory.createForClass(Relation);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Lighthouse {
  @Prop({ required: true, select: false, type: Buffer })
  testResult: Buffer;

  @Prop({ required: true, type: RelationSchema }) relations: Relation;

  @Prop({ required: true, type: TimingSchema })
  timing: Timing;
}

export type LighthouseDocument = HydratedDocument<Lighthouse>;

export const LighthouseSchema = SchemaFactory.createForClass(Lighthouse);

LighthouseSchema.index({ monitor: 1 });
