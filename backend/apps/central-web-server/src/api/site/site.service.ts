import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from './schemas/site.schema';

@Injectable()
export class SiteService {
  constructor(@InjectModel(Site.name) private siteModel: Model<SiteDocument>) {}
}