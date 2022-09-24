import { NeedMiddleware } from './need.middleware';

describe('NeedMiddleware', () => {
  it('should be defined', () => {
    expect(new NeedMiddleware()).toBeDefined();
  });
});
