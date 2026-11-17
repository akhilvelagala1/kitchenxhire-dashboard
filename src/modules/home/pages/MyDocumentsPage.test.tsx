import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { MyDocumentsPage } from './MyDocumentsPage';

function renderDocuments() {
  return render(
    <MemoryRouter initialEntries={['/user/documents']}>
      <Routes>
        <Route path="user/documents" element={<MyDocumentsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MyDocumentsPage', () => {
  it('shows the four sample documents instead of the placeholder', async () => {
    renderDocuments();
    expect(await screen.findByRole('heading', { name: 'My Documents' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Upload and manage your important documents for faster job applications and verification.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Aadhaar Card.pdf')).toBeInTheDocument();
    expect(screen.getByText('PAN Card.pdf')).toBeInTheDocument();
    expect(screen.getByText('Education Certificate.jpg')).toBeInTheDocument();
    expect(screen.getByText('Experience Letter.pdf')).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Total Documents' })).getByText('4')
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Verified' })).getByText('4')
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Under Review' })).getByText('0')
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Rejected' })).getByText('0')
    ).toBeInTheDocument();
    expect(screen.queryByText(/next prototype slice/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Complete your profile/i)).not.toBeInTheDocument();
  });

  it('filters by file name and category', async () => {
    const user = userEvent.setup();
    renderDocuments();
    await screen.findByText('Aadhaar Card.pdf');
    await user.type(screen.getByRole('searchbox'), 'pan');
    expect(screen.getByText('PAN Card.pdf')).toBeInTheDocument();
    expect(screen.queryByText('Aadhaar Card.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('Your Documents (1)')).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox'));
    await user.click(screen.getByRole('button', { name: 'Document type: All Documents' }));
    await user.click(screen.getByRole('option', { name: 'Education' }));
    expect(screen.getByText('Education Certificate.jpg')).toBeInTheDocument();
    expect(screen.queryByText('PAN Card.pdf')).not.toBeInTheDocument();
  });

  it('uploads a document and updates the counts', async () => {
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByRole('button', { name: 'Upload Document' }));
    const input = await screen.findByLabelText(/Document file/i);
    await user.upload(input, new File(['offer'], 'Offer Letter.pdf', { type: 'application/pdf' }));
    await user.click(screen.getByRole('button', { name: 'Save document' }));
    expect(await screen.findByText('Offer Letter.pdf')).toBeInTheDocument();
    expect(screen.getByText('Your Documents (5)')).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Total Documents' })).getByText('5')
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Under Review' })).getByText('1')
    ).toBeInTheDocument();
  });

  it('replaces and deletes a document', async () => {
    const user = userEvent.setup();
    renderDocuments();
    await screen.findByText('PAN Card.pdf');
    const replace = screen.getByLabelText('Replace: PAN Card.pdf');
    await user.upload(replace, new File(['pan'], 'New PAN.pdf', { type: 'application/pdf' }));
    expect(await screen.findByText('New PAN.pdf')).toBeInTheDocument();
    expect(screen.queryByText('PAN Card.pdf')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More actions: Aadhaar Card.pdf' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(
      await screen.findByRole('heading', { name: 'Delete this document?' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.queryByText('Aadhaar Card.pdf')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Total Documents' })).getByText('3')
    ).toBeInTheDocument();
  });

  it('downloads a sample document', async () => {
    const user = userEvent.setup();
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:doc');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    renderDocuments();
    await user.click(
      await screen.findByRole('button', { name: 'Download document: Aadhaar Card.pdf' })
    );
    expect(create).toHaveBeenCalled();
    create.mockRestore();
    revoke.mockRestore();
  });
});
