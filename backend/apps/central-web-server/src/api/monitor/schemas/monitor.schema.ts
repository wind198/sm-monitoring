import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LocationDocument } from 'apps/central-web-server/src/api/location/schemas/location.schema';
import { ProjectDocument } from 'apps/central-web-server/src/api/project/schemas/project.schema';
import { SiteDocument } from 'apps/central-web-server/src/api/site/schemas/site.schema';
import { ISoftDeletable } from 'apps/central-web-server/src/common/types/soft-deletable';
import { ILighthouseScores } from 'libs/types/src/check';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class Relations {
  @Prop({
    required: true,
    ref: 'Project',
    type: mongoose.SchemaTypes.ObjectId,
  })
  project: ProjectDocument;

  @Prop({
    required: true,
    ref: 'Site',
    type: mongoose.SchemaTypes.ObjectId,
  })
  site: SiteDocument;
}

const RelationSchema = SchemaFactory.createForClass(Relations);

@Schema({ _id: false })
export class Metadata {
  @Prop({
    required: true,
    ref: 'Location',
    type: String,
    refPath: 'code',
  })
  lastCheckedAtLocation: LocationDocument;
}

const MetadataSchema = SchemaFactory.createForClass(Metadata);

@Schema({ _id: false })
export class LatestData {
  @Prop({ required: true, type: mongoose.SchemaTypes.Mixed })
  scoreHistory: {
    timestamp: string;
    date: string;
    scores: ILighthouseScores;
    checkId: string;
  }[];

  @Prop() thumbnail: string;
}

const LatestDataSchema = SchemaFactory.createForClass(LatestData);

@Schema()
export class Monitor implements ISoftDeletable {
  @Prop()
  deletedAt: Date;

  @Prop({ required: true }) url: string;

  @Prop({ required: true }) name: string;

  @Prop({ type: MetadataSchema }) metadata: Metadata;

  @Prop({ type: LatestDataSchema, default: { scoreHistory: [] } })
  latestData: LatestData;

  @Prop({ required: true, type: RelationSchema })
  relations: Relations;
}

export type MonitorDocument = HydratedDocument<Monitor>;

export const MonitorSchema = SchemaFactory.createForClass(Monitor);
