import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { oAuthStorageDataSchema } from '../../../shared/schemas/oauth.schema.js';
import type {
  OAuthProviderData,
  OAuthProviderId,
  OAuthStorageData,
} from '../../../shared/types/oauth.types.js';

const OAUTH_DIR = join(homedir(), '.agentage');
const OAUTH_FILE = join(OAUTH_DIR, 'oauth.json');

const DEFAULT_DATA: OAuthStorageData = {
  providers: {},
};

/**
 * OAuth storage service - manages oauth.json file
 */
export class OAuthStorage {
  /**
   * Load OAuth data from file
   */
  async load(): Promise<OAuthStorageData> {
    try {
      const content = await readFile(OAUTH_FILE, 'utf-8');
      const parsed = JSON.parse(content) as unknown;
      return oAuthStorageDataSchema.parse(parsed);
    } catch {
      return DEFAULT_DATA;
    }
  }

  /**
   * Save OAuth data to file
   */
  async save(data: OAuthStorageData): Promise<void> {
    await mkdir(OAUTH_DIR, { recursive: true });
    const validated = oAuthStorageDataSchema.parse(data);
    await writeFile(OAUTH_FILE, JSON.stringify(validated, null, 2), { mode: 0o600 });
  }

  /**
   * Save a single provider's data
   */
  async saveProvider(providerId: OAuthProviderId, providerData: OAuthProviderData): Promise<void> {
    const data = await this.load();
    data.providers[providerId] = providerData;
    await this.save(data);
  }

  /**
   * Remove a provider's data
   */
  async removeProvider(providerId: OAuthProviderId): Promise<void> {
    const data = await this.load();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete data.providers[providerId];
    await this.save(data);
  }

  /**
   * Get a single provider's data
   */
  async getProvider(providerId: OAuthProviderId): Promise<OAuthProviderData | undefined> {
    const data = await this.load();
    return data.providers[providerId];
  }
}
