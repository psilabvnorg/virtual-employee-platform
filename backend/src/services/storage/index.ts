import { config } from '../../config';
import { IStorageAdapter } from './IStorageAdapter';
import { GoogleDriveAdapter } from './GoogleDriveAdapter';
import { S3Adapter } from './S3Adapter';
import { SFTPAdapter } from './SFTPAdapter';
import { AzureBlobAdapter } from './AzureBlobAdapter';

let _adapter: IStorageAdapter | null = null;

export function getStorageAdapter(): IStorageAdapter {
  if (_adapter) return _adapter;
  switch (config.storageAdapter) {
    case 'google-drive':
      _adapter = new GoogleDriveAdapter();
      break;
    case 's3':
      _adapter = new S3Adapter();
      break;
    case 'sftp':
      _adapter = new SFTPAdapter();
      break;
    case 'azure':
      _adapter = new AzureBlobAdapter();
      break;
    default:
      throw new Error(`Unknown storage adapter: ${config.storageAdapter}`);
  }
  return _adapter;
}
