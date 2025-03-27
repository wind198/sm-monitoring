import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema()
export class Location {
  @Prop({ required: true, index: true }) name: string;
  @Prop({ required: true, index: true, immutable: true, unique: true })
  code: string;
}

export type LocationDocument = HydratedDocument<Location>;

export const LocationSchema = SchemaFactory.createForClass(Location);
