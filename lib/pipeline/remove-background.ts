import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

export async function removeBackground(input: Blob): Promise<Blob> {
  return imglyRemoveBackground(input);
}
