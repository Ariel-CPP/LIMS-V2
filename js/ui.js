export function setActiveMenu(id) {
  document.querySelectorAll('nav .menu a').forEach(a => {
    if (a.id === id) a.classList.add('active'); else a.classList.remove('active');
  });
}
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}
