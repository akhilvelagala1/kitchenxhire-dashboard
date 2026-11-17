import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsyncSelect, type Option } from './AsyncSelect';

function Harness({ loadOptions }: { loadOptions: (s: string) => Promise<Option[]> }) {
  const [value, setValue] = useState<Option | null>(null);
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AsyncSelect
        queryKey={['test']}
        loadOptions={loadOptions}
        value={value}
        onChange={setValue}
      />
      <output>{value?.label ?? 'none'}</output>
    </QueryClientProvider>
  );
}

describe('AsyncSelect', () => {
  it('searches on the server and selects an option with the keyboard', async () => {
    const loadOptions = vi.fn(async (s: string) =>
      s ? [{ value: '1', label: `Match ${s}` }] : []
    );
    render(<Harness loadOptions={loadOptions} />);

    await userEvent.type(screen.getByRole('combobox'), 'ghee');
    await screen.findByRole('option', { name: 'Match ghee' });
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(screen.getByText('Match ghee', { selector: 'output' })).toBeInTheDocument()
    );
    expect(loadOptions).toHaveBeenLastCalledWith('ghee');
  });
});
