let candidates = [
  'Just some thoughts.',
  'Ain\'t that cool.',
  'Didn\'t know that.',
  'Okay then.',
  'Yay for virtualization.'
];

function getPhrase(phrases) {
  let header = document.getElementById('quote');
  picked = phrases[Math.floor(Math.random() * phrases.length)];
  header.innerHTML = picked;
}

document.addEventListener('DOMContentLoaded', function () {
  getPhrase(candidates);
});
