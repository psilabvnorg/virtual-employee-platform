import { DocRecord } from '../../types';
import { IStorageAdapter, UploadOptions } from './IStorageAdapter';

export class AzureBlobAdapter implements IStorageAdapter {
  async upload(_opts: UploadOptions): Promise<never> {
    throw new Error('AzureBlobAdapter not implemented — wire up @azure/storage-blob and container config');
  }
  async list(): Promise<DocRecord[]> {
    throw new Error('AzureBlobAdapter not implemented');
  }
}
