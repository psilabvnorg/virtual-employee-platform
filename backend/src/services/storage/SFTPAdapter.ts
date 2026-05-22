import { DocRecord } from '../../types';
import { IStorageAdapter, UploadOptions } from './IStorageAdapter';

export class SFTPAdapter implements IStorageAdapter {
  async upload(_opts: UploadOptions): Promise<never> {
    throw new Error('SFTPAdapter not implemented — wire up ssh2-sftp-client and host config');
  }
  async list(): Promise<DocRecord[]> {
    throw new Error('SFTPAdapter not implemented');
  }
}
