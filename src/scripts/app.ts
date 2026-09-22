/**
 * Browser-side behaviour: lesson progress (kept in this browser's localStorage),
 * the light/dark switch and the mobile lessons menu.
 */

const DONE_KEY = 'ml-workout:done';
const THEME_KEY = 'ml-workout:theme';

function readDone(): Set<string> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]');
    return new Set(Array.isArray(stored) ? stored.filter((url) => typeof url === 'string') : []);
  } catch {
    return new Set();
  }
}

function writeDone(done: Set<string>) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
  } catch {
    // Storage is unavailable (e.g. private mode): progress lasts until the page is left.
  }
}

let done = readDone();

function paintProgress() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-lesson]')) {
    el.classList.toggle('is-done', done.has(el.dataset.lesson!));
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-progress]')) {
    const urls: string[] = JSON.parse(el.dataset.progress!);
    const count = urls.filter((url) => done.has(url)).length;
    el.style.setProperty('--progress', urls.length ? String(count / urls.length) : '0');
    el.classList.toggle('is-complete', urls.length > 0 && count === urls.length);
    for (const label of el.querySelectorAll<HTMLElement>('[data-progress-label]')) {
      if (label.closest('[data-progress]') === el) label.textContent = `${count}/${urls.length}`;
    }
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-done-toggle]')) {
    button.setAttribute('aria-pressed', String(done.has(button.dataset.doneToggle!)));
  }

  const nextUp = document.querySelector<HTMLAnchorElement>('[data-next-up]');
  if (nextUp) {
    const lessons: { url: string; title: string }[] = JSON.parse(nextUp.dataset.nextUp!);
    const next = lessons.find((lesson) => !done.has(lesson.url));
    const started = lessons.some((lesson) => done.has(lesson.url));
    const target = next ?? lessons[0];
    nextUp.href = target.url;
    nextUp.querySelector('[data-next-label]')!.textContent = !next
      ? 'All done! Review'
      : started
        ? 'Continue with'
        : 'Start with';
    nextUp.querySelector('[data-next-title]')!.textContent = target.title;
  }
}

document.addEventListener('click', (event) => {
  const target = event.target as Element;

  const doneToggle = target.closest<HTMLButtonElement>('[data-done-toggle]');
  if (doneToggle) {
    const url = doneToggle.dataset.doneToggle!;
    done = readDone();
    if (done.has(url)) done.delete(url);
    else done.add(url);
    writeDone(done);
    paintProgress();
  }

  if (target.closest('[data-theme-toggle]')) {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Not remembered; the theme still applies to this page.
    }
  }

  if (target.closest('[data-nav-toggle]')) setNavOpen(!document.documentElement.classList.contains('nav-open'));
  else if (target.closest('[data-nav-close], .sidebar a')) setNavOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setNavOpen(false);
});

// Another tab marked a lesson as done.
window.addEventListener('storage', (event) => {
  if (event.key === DONE_KEY) {
    done = readDone();
    paintProgress();
  }
});

function setNavOpen(open: boolean) {
  document.documentElement.classList.toggle('nav-open', open);
  document.querySelector('[data-nav-toggle]')?.setAttribute('aria-expanded', String(open));
}

paintProgress();

// Long course? Scroll the sidebar so the current lesson is visible.
const sidebar = document.querySelector<HTMLElement>('.sidebar');
const activeLink = sidebar?.querySelector<HTMLElement>('[aria-current="page"]');
if (sidebar && activeLink) {
  const offset = activeLink.getBoundingClientRect().top - sidebar.getBoundingClientRect().top;
  if (offset > sidebar.clientHeight * 0.8) sidebar.scrollTop = offset - sidebar.clientHeight / 3;
}
