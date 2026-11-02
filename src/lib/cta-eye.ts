// The buttons' eye: the cut-paper eye of the INSO case (components/story/icons/eye.svg) with a disc behind each
// iris (.a-cta__iris), filled only on the dark button (styles/media-a.css) so the dark pupil shows inside it.
// Each call gives the eye's clip paths their own ids: with shared ids a page's eyes all clip by the first one
import eye from '../components/story/icons/eye.svg?raw';

let n = 0;
export const ctaEye = () => {
  n += 1;
  return eye
    .replace(/eye-(half|open)/g, `eye-$1-${n}`)
    .replace(/<g clip-path="url\(#eye-(half|open)-\d+\)">/g, '$&<circle class="a-cta__iris" cx="120.8" cy="118" r="29.5"/>');
};
