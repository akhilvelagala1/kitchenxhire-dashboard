import { render, screen } from '@testing-library/react';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('shows the title, content and footer when open', () => {
    render(
      <Dialog open onClose={() => {}} title="Archive category" footer={<button>Confirm</button>}>
        Are you sure?
      </Dialog>
    );

    expect(screen.getByRole('dialog', { name: 'Archive category' })).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('renders no content while closed', () => {
    render(
      <Dialog open={false} onClose={() => {}} title="Archive category">
        Are you sure?
      </Dialog>
    );

    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('in bare mode renders only the caller markup, named by the title, with the caller classes', () => {
    render(
      <Dialog open bare onClose={() => {}} title="Job details" className="rounded-3xl">
        <p>Body</p>
      </Dialog>
    );

    expect(screen.getByRole('dialog', { name: 'Job details' })).toHaveClass('rounded-3xl');
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
