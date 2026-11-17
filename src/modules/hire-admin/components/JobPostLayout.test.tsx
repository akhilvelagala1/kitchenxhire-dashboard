// jsdom has no layout engine, so these tests assert the class contract, not real sizes.
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderPage } from '@/shared/test/render';
import { JobPostForm } from './JobPostForm';
import {
  jobPostControl,
  jobPostCounter,
  jobPostFieldGrid,
  jobPostFormScope,
  jobPostLabel,
  jobPostTextarea
} from './jobPostStyles';

vi.mock('../api/adminJobsApi', () => ({ adminJobsApi: { create: vi.fn() } }));
vi.mock('@/shared/ui/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Compact sizes apply from lg up only, so phones keep the shared 44px / 14px defaults (UI-07).
// Anything with no exported constant to follow is written out here with its `lg:` prefix.
const CONTROL_HEIGHT = 'lg:h-[calc(30*var(--u))]';
const SKILL_HEIGHT = 'lg:h-[calc(24*var(--u))]';
const NO_MIN_HEIGHT = 'lg:min-h-0!';
const FIXED_CONTROL = [CONTROL_HEIGHT, NO_MIN_HEIGHT];
const PILL_BUTTON = ['lg:rounded-full!', NO_MIN_HEIGHT];
const UNIT_HEIGHT = /^lg:h-\[calc\(\d+\*var\(--u\)\)\]$/;
const CARD_CHROME = ['rounded-xl', 'border', 'bg-surface', 'lg:pt-2'];
const CARD_TITLES = [
  'Job Information',
  'Job Location',
  'Employment Details',
  'Job Details',
  'Application Settings'
];

const classTokens = (value: string) => value.split(/\s+/).filter(Boolean);

function hasClasses(element: Element, wanted: string[]) {
  const have = classTokens(element.getAttribute('class') ?? '');
  return wanted.every((token) => have.includes(token));
}

/** A short name for a failure message: the aria-label, else the field's label or button text. */
function nameOf(control: HTMLElement) {
  const labels = [...document.querySelectorAll('label')];
  const label = control.id ? labels.find((item) => item.htmlFor === control.id) : undefined;
  return control.getAttribute('aria-label') ?? label?.textContent ?? control.textContent;
}

/** The names of the controls that miss any wanted class, so a failing run says which fields. */
function lacking(controls: HTMLElement[], wanted: string[]) {
  return controls.filter((control) => !hasClasses(control, wanted)).map(nameOf);
}

function renderForm() {
  renderPage(<JobPostForm onSaved={vi.fn()} />);
  const publish = screen.getByRole('button', { name: 'Publish Job' });
  const saveDraft = screen.getByRole('button', { name: 'Save as Draft' });
  const form = publish.closest('form');
  if (!form) throw new Error('Expected the Publish Job button to sit inside the form');
  return { form, publish, saveDraft };
}

const skillBox = () => screen.getByRole('textbox', { name: 'Add a skill' });

/** Every text, number and date input, every select and every textarea inside the form. */
function controlsIn(form: HTMLElement) {
  return {
    inputs: [...form.querySelectorAll('input')].filter((input) =>
      ['text', 'number', 'date'].includes(input.type)
    ),
    selects: [...form.querySelectorAll('select')],
    textareas: [...form.querySelectorAll('textarea')]
  };
}

describe('Post a Job form layout', () => {
  describe('shared styles', () => {
    it('exports every shared style as a non-empty class string', () => {
      const styles = {
        jobPostControl,
        jobPostTextarea,
        jobPostLabel,
        jobPostCounter,
        jobPostFieldGrid,
        jobPostFormScope
      };

      Object.entries(styles).forEach(([name, value]) => {
        expect(typeof value, name).toBe('string');
        expect(classTokens(value), name).not.toHaveLength(0);
      });
    });

    it('fixes the shared control at 30 units tall and clears the 44px minimum height', () => {
      expect(classTokens(jobPostControl)).toEqual(expect.arrayContaining(FIXED_CONTROL));
    });

    it('fixes the shared textarea at a height in design units and clears the minimum', () => {
      expect(classTokens(jobPostTextarea)).toEqual(
        expect.arrayContaining([NO_MIN_HEIGHT, expect.stringMatching(UNIT_HEIGHT)])
      );
    });

    it('applies the control, textarea and form scope overrides from lg up only', () => {
      [jobPostControl, jobPostTextarea, jobPostFormScope].forEach((styles) => {
        const always = classTokens(styles).filter((token) => !token.startsWith('lg:'));

        expect(always).toEqual([]);
      });
    });

    it('sets the label text size through the form scope', () => {
      expect(classTokens(jobPostFormScope)).toContain('lg:[&_label]:text-dense-sm');
    });
  });

  describe('form', () => {
    it('fills the page as a flex column that carries the label and error scope', () => {
      const { form } = renderForm();

      expect(form).toHaveClass('flex', 'flex-col', 'flex-1', ...classTokens(jobPostFormScope));
    });

    it('keeps the five cards in one container with a 13 unit gap', () => {
      const { form } = renderForm();

      const cards = CARD_TITLES.map((title) => within(form).getByRole('region', { name: title }));
      const containers = new Set(cards.map((card) => card.parentElement));

      expect(containers.size).toBe(1);
      expect([...containers][0]).toHaveClass('gap-[calc(13*var(--u))]');
    });
  });

  describe('action row', () => {
    it('is not sticky anywhere in the form', () => {
      const { form } = renderForm();

      const sticky = [form, ...form.querySelectorAll('*')].filter((element) =>
        element.classList.contains('sticky')
      );

      expect(sticky).toHaveLength(0);
    });

    it('sits at the bottom of the flex column form behind an auto top margin', () => {
      const { publish, saveDraft } = renderForm();
      const row = publish.parentElement;

      expect(row).toHaveClass('mt-auto');
      expect(saveDraft.parentElement).toBe(row);
      expect(row?.parentElement).toHaveClass('flex', 'flex-col');
    });

    it('shows Save as Draft and Publish Job as pills with no minimum height from lg', () => {
      const { publish, saveDraft } = renderForm();

      expect(saveDraft).toHaveClass(...PILL_BUTTON);
      expect(publish).toHaveClass(...PILL_BUTTON);
    });
  });

  describe('controls', () => {
    it('gives every select the shared control classes', () => {
      const { form } = renderForm();
      const { selects } = controlsIn(form);

      expect(selects.length).toBeGreaterThanOrEqual(8);
      expect(lacking(selects, classTokens(jobPostControl))).toEqual([]);
    });

    it('gives every input but the skill box the shared control classes', () => {
      const { form } = renderForm();
      const inputs = controlsIn(form).inputs.filter((input) => input !== skillBox());

      expect(inputs.length).toBeGreaterThanOrEqual(6);
      expect(lacking(inputs, classTokens(jobPostControl))).toEqual([]);
    });

    it('gives both salary inputs the shared control classes', () => {
      renderForm();
      const salary = [
        screen.getByRole('spinbutton', { name: 'Minimum salary' }),
        screen.getByRole('spinbutton', { name: 'Maximum salary' })
      ];

      expect(lacking(salary, classTokens(jobPostControl))).toEqual([]);
    });

    it('makes the skill box 24 units tall with no minimum height, not 30', () => {
      renderForm();

      expect(skillBox()).toHaveClass(SKILL_HEIGHT, NO_MIN_HEIGHT);
      expect(skillBox()).not.toHaveClass(CONTROL_HEIGHT);
    });

    it('gives every textarea the shared textarea classes', () => {
      const { form } = renderForm();
      const { textareas } = controlsIn(form);

      expect(textareas.length).toBeGreaterThanOrEqual(3);
      expect(lacking(textareas, classTokens(jobPostTextarea))).toEqual([]);
    });

    it('leaves phones on the shared 44px minimum height for every control and button', () => {
      const { form, publish, saveDraft } = renderForm();
      const { inputs, selects, textareas } = controlsIn(form);
      const everything = [...inputs, ...selects, ...textareas, saveDraft, publish];

      const shrunk = everything.filter((element) => hasClasses(element, ['min-h-0!']));

      expect(shrunk.map(nameOf)).toEqual([]);
    });
  });

  describe('cards', () => {
    it.each(CARD_TITLES)('draws the %s card with the compact chrome from lg up', (title) => {
      const { form } = renderForm();
      const card = within(form).getByRole('region', { name: title });

      expect(card).toHaveClass(...CARD_CHROME);
      expect(card).not.toHaveClass('pt-2');
    });
  });
});
