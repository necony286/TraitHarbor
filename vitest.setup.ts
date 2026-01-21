import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

process.env.REPORT_ACCESS_TOKEN_PEPPER ??= 'test-report-access-pepper';

expect.extend(toHaveNoViolations);
