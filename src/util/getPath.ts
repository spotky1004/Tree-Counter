import path from "path";
import { fileURLToPath } from 'url';

export default function getPath(url: string) {
  const __filename = fileURLToPath(url);
  const __dirname = path.dirname(__filename);
  return {
    __filename,
    __dirname,
  };
}
