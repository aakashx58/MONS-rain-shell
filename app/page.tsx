import MonsHero from '@/components/MonsHero';
import { generateContourSvgDataUrl } from '@/lib/contour';

export default function Page() {
  const contourUrl = generateContourSvgDataUrl();
  return <MonsHero contourUrl={contourUrl} />;
}
