import desktop from 'lighthouse/core/config/desktop-config';
import LighthouseConfig from 'lighthouse/types/config';
import { merge } from 'lodash';

export const DesktopConfig = merge(desktop, {
  settings: {
    disableFullPageScreenshot: true,
  },
} as LighthouseConfig);

export const SimpleDesktopConfig = merge(desktop, {
  settings: {
    disableFullPageScreenshot: false,
    onlyCategories: ['performance'],
    onlyAudits: [
      'first-contentful-paint',
      'speed-index',
      'interactive',
      'total-blocking-time',
      'largest-contentful-paint',
    ],
  },
} as LighthouseConfig);
