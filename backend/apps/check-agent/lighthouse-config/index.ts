import desktop from 'lighthouse/core/config/desktop-config';
import LighthouseConfig from 'lighthouse/types/config';
import { merge } from 'lodash';

export const DesktopConfig = merge(desktop, {
  settings: { disableFullPageScreenshot: true },
} as LighthouseConfig);
