import { SyncMiddleware } from './sync.middleware';

describe('SyncMiddleware', () => {
  it('should be defined', () => {
    expect(new SyncMiddleware()).toBeDefined();
  });
});
