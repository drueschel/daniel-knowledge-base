import fs from 'fs';
import path from 'path';

export class ObsidianWriter {
  // Hardcoded vault path based on the user's workspace knowledge base structure
  private vaultBasePath = '/Users/danielrueschel/DEV/daniel-knowledge-base/src/content/de/YouTube_Imports';

  constructor() {
    // Ensure the target directory exists
    if (!fs.existsSync(this.vaultBasePath)) {
      fs.mkdirSync(this.vaultBasePath, { recursive: true });
    }
  }

  public saveToVault(filename: string, content: string): string {
    const filePath = path.join(this.vaultBasePath, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }
}
