import { XcStoragePlugin } from 'nc-plugin';
import S3CMC from './S3CMC';
import type { IStorageAdapterV2 } from 'nc-plugin';

class S3CMCPlugin extends XcStoragePlugin {
  private static storageAdapter: S3CMC;

  public getAdapter(): IStorageAdapterV2 {
    return S3CMCPlugin.storageAdapter;
  }

  public async init(config: any): Promise<any> {
    S3CMCPlugin.storageAdapter = new S3CMC(config);
    await S3CMCPlugin.storageAdapter.init();
  }
}

export default S3CMCPlugin;
