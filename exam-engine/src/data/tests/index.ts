import test1Raw from './test1.json';
import { IELTSAcademicTestSchema, type IELTSAcademicTest } from '../../utils/schema';

function validateTest(data: unknown): IELTSAcademicTest {
  const parsed = IELTSAcademicTestSchema.safeParse(data);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('[TestSchema] Invalid test JSON', parsed.error.flatten());
    throw new Error('Invalid test JSON schema');
  }
  return parsed.data;
}

export const tests: Record<string, IELTSAcademicTest> = {
  test1: validateTest(test1Raw),
};

