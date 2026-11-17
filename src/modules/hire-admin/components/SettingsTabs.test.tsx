import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '@/shared/test/render';
import { SettingsTabs } from './SettingsTabs';

describe('SettingsTabs', () => {
  it('lists the seven sections in order under one tab list', () => {
    renderPage(<SettingsTabs />);

    const tabs = within(screen.getByRole('tablist', { name: 'Settings sections' })).getAllByRole(
      'tab'
    );

    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'General',
      'Hiring & Jobs',
      'Users & Roles',
      'Notifications',
      'Integrations',
      'Security',
      'Audit & Logs'
    ]);
  });

  it('selects General by default and leaves the live tabs enabled', () => {
    renderPage(<SettingsTabs />);

    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Hiring & Jobs' })).toBeEnabled();
    expect(screen.getByRole('tab', { name: 'Users & Roles' })).toBeEnabled();
    expect(screen.getByRole('tab', { name: 'Notifications' })).toBeEnabled();
    expect(screen.getByRole('tab', { name: 'Integrations' })).toBeEnabled();
    expect(screen.getByRole('tab', { name: 'Security' })).toBeEnabled();
    expect(screen.getByRole('tab', { name: 'Audit & Logs' })).toBeEnabled();
    expect(screen.getByRole('tab', { name: 'Hiring & Jobs' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('switches to Hiring & Jobs through the tab URL param', async () => {
    renderPage(<SettingsTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'Hiring & Jobs' }));

    expect(screen.getByRole('tab', { name: 'Hiring & Jobs' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'false');
  });

  it('switches to Users & Roles through the tab URL param', async () => {
    renderPage(<SettingsTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'Users & Roles' }));

    expect(screen.getByRole('tab', { name: 'Users & Roles' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'false');
  });

  it('switches to Notifications through the tab URL param', async () => {
    renderPage(<SettingsTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));

    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'false');
  });

  it('switches to Integrations through the tab URL param', async () => {
    renderPage(<SettingsTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'Integrations' }));

    expect(screen.getByRole('tab', { name: 'Integrations' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'false');
  });

  it('switches to Security through the tab URL param', async () => {
    renderPage(<SettingsTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'Security' }));

    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'false');
  });

  it('switches to Audit & Logs through the tab URL param', async () => {
    renderPage(<SettingsTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'Audit & Logs' }));

    expect(screen.getByRole('tab', { name: 'Audit & Logs' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'false');
  });
});
