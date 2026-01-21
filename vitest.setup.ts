import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { toHaveNoViolations } from 'jest-axe';

process.env.REPORT_ACCESS_TOKEN_PEPPER ??= 'test-report-access-pepper';

expect.extend(toHaveNoViolations);
