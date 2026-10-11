import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';

describe('application foundation', () => {
  it('renders its shell without a browser or persistence dependency', () => {
    const markup = renderToStaticMarkup(<App />);
    expect(markup).toContain('<main');
    expect(markup).toContain('TaskFlow');
    expect(markup).not.toContain('<form');
  });
});
