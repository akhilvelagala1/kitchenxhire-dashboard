import { CITIES, NAV_LINKS } from '../content/nav';
import { useHomeState } from '../hooks/useHomeState';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { JobSeekerAccountMenu } from './JobSeekerAccountMenu';
import { LanguagePicker } from './LanguagePicker';
import { homeButton } from './styles';

const linkClass =
  'flex min-h-12 w-full items-center border-b border-line-soft text-left text-[15px] font-bold text-ink';

interface MobileMenuProps {
  onClose: () => void;
  onLogin: () => void;
}

/** The header's menu below 980px: the four links, a city select, Login and Post a Job. */
export function MobileMenu({ onClose, onLogin }: MobileMenuProps) {
  const { tx } = useHireLanguage();
  const { location, selectLocation, setFlow } = useHomeState();
  const { session } = useJobSeekerSession();

  return (
    <div
      id="mobileMenu"
      className="animate-menu-in border-t border-line-header bg-surface px-4 py-2 motion-reduce:animate-none min-[980px]:hidden"
    >
      <div className="w-full">
        {NAV_LINKS.map((link) => (
          <a key={link.target} href={`#${link.target}`} onClick={onClose} className={linkClass}>
            {tx(link.label)}
          </a>
        ))}
        <label
          htmlFor="locSelect"
          className="mt-3 block font-hire text-xs font-extrabold tracking-wider text-ink-400 uppercase"
        >
          {tx('City')}
        </label>
        <select // guard-allow: the prototype's native city select in the mobile menu
          id="locSelect"
          value={location}
          onChange={(event) => selectLocation(event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-line bg-muted px-3 text-sm font-bold"
        >
          {CITIES.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
        <div className="mt-4">
          <LanguagePicker />
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {session ? (
            <JobSeekerAccountMenu variant="block" />
          ) : (
            <button type="button" onClick={onLogin} className={homeButton('login-block')}>
              {tx('Login')}
            </button>
          )}
          <a
            href="#how"
            onClick={() => {
              setFlow('employer');
              onClose();
            }}
            className={homeButton('orange-block')}
          >
            {tx('Post a Job')}
          </a>
        </div>
      </div>
    </div>
  );
}
