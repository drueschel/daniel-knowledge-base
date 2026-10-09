import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('UGC E2E Flow', async ({ page }) => {
  // Create dummy video file
  const testVideoPath = path.join(process.cwd(), 'dummy.mp4');
  if (!fs.existsSync(testVideoPath)) {
    fs.writeFileSync(testVideoPath, 'dummy content');
  }

  await page.goto('http://localhost:3001');

  // Go to UGC Upload
  await page.click('button:has-text("Upload Video (UGC)")');
  
  // Set file chooser
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('text=Klicke hier, um ein Video auszuwählen');
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(testVideoPath);

  // Wait for audio_ready status text
  await expect(page.locator('text=Audio-Transkription (Karaoke-Text)')).toBeVisible({ timeout: 15000 });
  
  // Click Transkript OK
  await page.click('button:has-text("Transkript OK")');
  
  // Wait for storyboard_planned
  await expect(page.locator('text=Storyboard Geplant (A-Roll / B-Roll)')).toBeVisible({ timeout: 15000 });
  
  // Click Plan OK
  await page.click('button:has-text("Plan OK - Generiere Visuals (Maya)")');
  
  // Wait for visuals_ready
  await expect(page.locator('button:has-text("Pro Video Editor")')).toBeVisible({ timeout: 15000 });

  // Click Render
  await page.click('button:has-text("Finales Video Rendern")');

  // Wait for completion
  await expect(page.locator('text=HyperFrames Rendering abgeschlossen')).toBeVisible({ timeout: 15000 });
});
