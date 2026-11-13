
import { mergeTests } from '@playwright/test';

import { test as apiTest } from './apiFixtures';
import { test as uiTest } from './uiFixtures';

export const test = mergeTests(apiTest, uiTest);

export { expect } from '@playwright/test';
