import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecruiterOrganizationForm } from './RecruiterOrganizationForm';

const ACCOUNT_ID = '919876543210';

function renderForm() {
  const onSaved = vi.fn();
  const onCancel = vi.fn();
  render(
    <RecruiterOrganizationForm accountId={ACCOUNT_ID} onCancel={onCancel} onSaved={onSaved} />
  );
  return { onSaved, onCancel };
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Organization Name/), 'Spice Route Restaurant');
  await user.type(screen.getByLabelText(/GST Number/), '36AABCU9603R1ZO');
  await user.type(screen.getByLabelText(/Address Line 1/), 'Hitec City Main Road');
  await user.type(screen.getByLabelText(/PIN Code/), '500081');
}

function submitButton() {
  return screen.getByRole('button', { name: /Save & Continue/ });
}

describe('RecruiterOrganizationForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows no errors before the user interacts with the form', () => {
    renderForm();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('blocks an empty submit and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    const { onSaved } = renderForm();

    await user.click(submitButton());

    expect(await screen.findByText('Enter your organisation name.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization Name/)).toHaveFocus();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only organisation name', async () => {
    const user = userEvent.setup();
    const { onSaved } = renderForm();

    await user.type(screen.getByLabelText(/Organization Name/), '   ');
    await user.click(submitButton());

    expect(await screen.findByText('Enter your organisation name.')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('shows the checksum error under the GST number when the field loses focus', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/GST Number/), '36AABCU9603R1ZM');
    await user.tab();

    expect(await screen.findByText(/not valid\. Check all 15 characters/)).toBeInTheDocument();
  });

  it('clears the GST error as soon as the number is corrected', async () => {
    const user = userEvent.setup();
    renderForm();
    const gstNumber = screen.getByLabelText(/GST Number/);

    await user.type(gstNumber, '36AABCU9603R1ZM');
    await user.tab();
    await screen.findByText(/not valid\. Check all 15 characters/);

    await user.clear(gstNumber);
    await user.type(gstNumber, '36AABCU9603R1ZO');

    expect(screen.queryByText(/not valid\. Check all 15 characters/)).not.toBeInTheDocument();
  });

  it('saves a complete form without a GST certificate because the upload is optional', async () => {
    const user = userEvent.setup();
    const { onSaved } = renderForm();

    await fillValidForm(user);
    await user.click(submitButton());

    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Spice Route Restaurant',
        gstNumber: '36AABCU9603R1ZO',
        addressLine1: 'Hitec City Main Road',
        city: 'Hyderabad',
        state: 'Telangana',
        pinCode: '500081'
      })
    );
  });

  it('clears the city when the selected state cannot contain it', async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByLabelText(/City/)).toHaveValue('Hyderabad');
    await user.selectOptions(screen.getByLabelText(/State/), 'Karnataka');

    expect(screen.getByLabelText(/City/)).toHaveValue('');
  });

  it('shows the file name and size after a valid certificate upload', async () => {
    const user = userEvent.setup();
    renderForm();
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'gst.pdf', {
      type: 'application/pdf'
    });

    await user.upload(screen.getByLabelText('GST certificate file'), file);

    expect(await screen.findByText('gst.pdf · 4 B')).toBeInTheDocument();
  });

  it('rejects a certificate whose contents do not match its declared type', async () => {
    const user = userEvent.setup();
    renderForm();
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'fake.png', {
      type: 'image/png'
    });

    await user.upload(screen.getByLabelText('GST certificate file'), file);

    expect(await screen.findByText(/do not match its type/)).toBeInTheDocument();
  });

  it('rejects an empty certificate file', async () => {
    const user = userEvent.setup();
    renderForm();
    const file = new File([], 'empty.pdf', { type: 'application/pdf' });

    await user.upload(screen.getByLabelText('GST certificate file'), file);

    expect(await screen.findByText('That file is empty. Choose another file.')).toBeInTheDocument();
  });
});
