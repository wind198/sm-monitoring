import { Injectable } from '@nestjs/common';
import { UserService } from './api/user/user.service';
import { LocationService } from './api/location/location.service';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private readonly locationService: LocationService,
  ) {}

  async mockData() {
    if (!(await this.locationService.locationModel.countDocuments())) {
      await this.locationService.mockLocations();
    }

    await this.userService.mockSuperUser();
  }
}
