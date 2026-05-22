import { DocRecord } from '../../types';
import { IStorageAdapter, UploadOptions } from './IStorageAdapter';

export class S3Adapter implements IStorageAdapter {
  async upload(_opts: UploadOptions): Promise<never> {
    throw new Error('S3Adapter not implemented — wire up AWS SDK and bucket config');
  }
  async list(): Promise<DocRecord[]> {
    throw new Error('S3Adapter not implemented');
  }
}
