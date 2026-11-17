/**
 * Design sizes for the Post a Job page. From lg it is a fit page (`fit-scale fit-scale-post-job`): one
 * unit is one pixel of the 1561x1008 reference and `var(--u)` shrinks everything to fit the window.
 * Below lg the `lg:` classes drop out, so controls keep the shared 44px / 14px defaults and the page
 * scrolls. The `!` beats the shared Input / Select / Textarea defaults (min-h-11, px-3, text-sm,
 * rounded-xl).
 */
export const jobPostControl =
  'lg:h-[calc(30*var(--u))] lg:min-h-0! lg:rounded-lg! lg:px-3.5! lg:text-dense-md!';
export const jobPostTextarea =
  'lg:h-[calc(78*var(--u))] lg:min-h-0! lg:resize-none lg:rounded-lg! lg:px-3.5! lg:py-1.5! lg:text-dense-md! lg:leading-4!';
/** A label the shared Field does not render (the salary range group); same as Field's label below lg. */
export const jobPostLabel =
  'text-sm font-medium text-ink lg:text-dense-sm lg:font-bold lg:leading-3.5';
/** The `{n} / 500` line under a textarea. */
export const jobPostCounter = 'mt-1 text-right text-xs text-ink-soft lg:text-dense-sm lg:leading-3';
export const jobPostFieldGrid = 'grid gap-x-5 gap-y-3 md:grid-cols-2 lg:grid-cols-4';
/** On the form, from lg: Field's label and error text become 11 units; descendant selectors out-rank Field's own classes. */
export const jobPostFormScope =
  'lg:[&_label]:text-dense-sm lg:[&_label]:font-bold lg:[&_label]:leading-3.5 lg:[&_[role=alert]]:text-dense-sm lg:[&_[role=alert]]:leading-3.5';
