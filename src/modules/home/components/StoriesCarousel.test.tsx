import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { STORIES } from '../content/stories';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { StoriesCarousel } from './StoriesCarousel';

function reduceMotion() {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce')
  })) as typeof window.matchMedia;
}

function renderCarousel(props = {}) {
  return render(
    <HomeStateProvider>
      <StoriesCarousel {...props} />
    </HomeStateProvider>
  );
}

describe('StoriesCarousel', () => {
  afterEach(() => vi.useRealTimers());

  it('renders kicker and headline', () => {
    renderCarousel();

    expect(screen.getByText('Real people. Real kitchen work.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Built around real kitchen work.' })
    ).toBeInTheDocument();
  });

  it('shows the stories in order and advances one card every three seconds', () => {
    vi.useFakeTimers();
    reduceMotion();
    renderCarousel({ stories: STORIES });
    const first = () => screen.getAllByRole('article')[0]!;
    expect(first()).toHaveTextContent(STORIES[0]!.name);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(first()).toHaveTextContent(STORIES[1]!.name);
  });

  it('stops advancing while the pointer is over the carousel', () => {
    vi.useFakeTimers();
    reduceMotion();
    const { container } = renderCarousel({ stories: STORIES });
    const viewport = container.querySelector('.touch-pan-y')!;

    act(() => {
      viewport.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    expect(screen.getAllByRole('article')[0]).toHaveTextContent(STORIES[0]!.name);
  });

  it('stops advancing when focused and resumes when blurred', () => {
    vi.useFakeTimers();
    reduceMotion();
    const { container } = renderCarousel({ stories: STORIES });
    const viewport = container.querySelector('.touch-pan-y')!;

    // Focus into carousel - should pause
    act(() => {
      fireEvent.focus(viewport);
    });
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getAllByRole('article')[0]).toHaveTextContent(STORIES[0]!.name);

    // Blur from carousel - should resume
    act(() => {
      fireEvent.blur(viewport);
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getAllByRole('article')[0]).toHaveTextContent(STORIES[1]!.name);
  });

  it('applies lazy loading and async decoding to story avatars', () => {
    const { container } = renderCarousel({ stories: STORIES });
    const avatars = container.querySelectorAll('img');
    expect(avatars.length).toBeGreaterThanOrEqual(1);

    avatars.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    });
  });

  it('keeps front styling on the center card without premature right-card highlight during slide', () => {
    vi.useFakeTimers();
    renderCarousel({ stories: STORIES });
    const articles = screen.getAllByRole('article');
    // Middle card (index 1) has front styling (orange top border)
    expect(articles[1]).toHaveClass('border-t-brand-600');
    // Right card (index 2) does not have front styling
    expect(articles[2]).not.toHaveClass('border-t-brand-600');

    // Advance to initiate slide
    const firstArticle = articles[0]!;
    vi.spyOn(firstArticle, 'getBoundingClientRect').mockReturnValue({
      width: 300,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 300,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const activeArticles = screen.getAllByRole('article');
    // Right card (index 2) must STILL NOT have front styling prematurely during slide
    expect(activeArticles[2]).not.toHaveClass('border-t-brand-600');
    // Center card (index 1) remains the front card
    expect(activeArticles[1]).toHaveClass('border-t-brand-600');
  });

  it('handles empty stories gracefully without crashing', () => {
    const { container } = renderCarousel({ stories: [] });
    expect(container.firstChild).toBeNull();
  });

  it('renders tablet peek classes and allows clicking side cards to navigate', () => {
    vi.useFakeTimers();
    reduceMotion();
    renderCarousel({ stories: STORIES });
    const articles = screen.getAllByRole('article');

    // Verify center card has z-10 and hero styling
    expect(articles[1]).toHaveClass('z-10');
    expect(articles[1]).toHaveClass('border-t-brand-600');

    // Verify side cards have peek opacity and cursor-pointer
    expect(articles[0]).toHaveClass('cursor-pointer');
    expect(articles[0]).toHaveClass('min-[768px]:opacity-70');
    expect(articles[2]).toHaveClass('cursor-pointer');
    expect(articles[2]).toHaveClass('min-[768px]:opacity-70');

    // Clicking the right card advances to the next story
    act(() => {
      fireEvent.click(articles[2]!);
    });
    const updatedArticles = screen.getAllByRole('article');
    expect(updatedArticles[0]).toHaveTextContent(STORIES[1]!.name);

    // Clicking the left card goes back to the previous story
    act(() => {
      fireEvent.click(updatedArticles[0]!);
    });
    const resetArticles = screen.getAllByRole('article');
    expect(resetArticles[0]).toHaveTextContent(STORIES[0]!.name);
  });
});
