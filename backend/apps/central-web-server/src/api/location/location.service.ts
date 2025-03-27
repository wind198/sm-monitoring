import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocationDto } from 'apps/central-web-server/src/api/location/dtos/create-location.dto';
import { Model } from 'mongoose';
import { Location, LocationDocument } from './schemas/location.schema';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) public locationModel: Model<LocationDocument>,
  ) {}

  mockLocations() {
    const locations: CreateLocationDto[] = [];
    locations.push(
      { name: 'US East', code: 'us_east' },
      { name: 'US West', code: 'us_west' },
    );

    return this.locationModel.insertMany(locations);
  }
}
