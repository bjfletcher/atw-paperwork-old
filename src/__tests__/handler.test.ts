import 'source-map-support/register';

test('basic', async () => {
  throw new Error('line number 4');
});