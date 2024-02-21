const SHOW_AVAILABLE_ONLY = true;

console.log('Flyspot Schedule Export enabled: listening for URL changes...');

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    onUrlChange();
  }
}).observe(document, {subtree: true, childList: true});

function onUrlChange() {
  const url = new URL(location.href);

  if (
    url.hostname === 'cs.flyspot.com' &&
    url.searchParams.get('currentStep')?.startsWith('calendar-Minutes-')
  ) {
    console.log('Flyspot Schedule Export: detected calendar view');

    appendExportButton();
  }
}

function appendExportButton() {
  const exportButton = document.createElement('a');
  exportButton.setAttribute('class', 'cs-button cs-fluid-animation btn');
  exportButton.textContent = 'Export Schedule';
  exportButton.onclick = exportSchedule;

  const exportButtonContainer = document.querySelector(
    '#day-view-slots-table-helper > div.sticky-desktop-container.cs-fluid-animation'
  );

  exportButtonContainer?.appendChild(exportButton);
}

type Schedule = {
  start: Date;
  end: Date;
  available: boolean;
  freeMinutes: number;
}[];

function parseSchedule() {
  const slots = document.querySelectorAll('#day-view-slots-table > tr > td');

  const schedule: Schedule = [];

  const day = document
    .querySelector(
      '#months-slider > div > div > div > button.slick-slide.slick-current.slick-center'
    )
    ?.getAttribute('data-date');

  if (!day) return;

  slots.forEach(slot => {
    const startTime = slot
      .querySelector('span.slot-text-helper.slot-time-scope')
      ?.textContent?.split(' ')[0];

    if (!startTime) return;
    const start = new Date(`${day} ${startTime}`);
    const end = new Date(Number(start) + 30 * 60 * 1000);

    const available = slot.classList.contains('available');

    const freeMinutes = Number(
      slot.querySelector('.slot-bar-text')?.textContent?.split(' ')[0]
    );

    schedule.push({start, end, available, freeMinutes});
  });

  return schedule;
}

function exportSchedule() {
  const schedule = parseSchedule();

  if (!schedule) return console.error('Failed to parse schedule');

  // The table separator is this: "	"
  // It's not a normal whitespace

  navigator.clipboard
    .writeText(
      schedule
        ?.filter(slot => !SHOW_AVAILABLE_ONLY || slot.available)
        .map(slot => `${getTime(slot.start)}	${slot.freeMinutes} minutes`)
        .join('\n')
    )
    .then(() => {
      console.log('Flyspot Schedule Export: copied to clipboard');
    })
    .catch(err => {
      console.error(
        'Flyspot Schedule Export: failed to copy to clipboard',
        err
      );
    });
}

function getTime(date: Date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}
