let dragging;

const drag = ev => {
  dragging = ev.target;
  ev.dataTransfer.setData("text", ev.target.innerText);
  ev.dataTransfer.effectAllowed = "move";
  window.requestAnimationFrame(() => {
    dragging.classList.add("item--dragging");
  });
};

const leave = ev => {
  // only act when exiting item
  if (!ev.target.classList.contains("item")) return;
  const targetRect = ev.target.getBoundingClientRect();
  const parent = ev.target.closest(".parent");
  if (ev.y > targetRect.bottom)
    parent.insertBefore(dragging, ev.target.nextSibling);
  else 
    parent.insertBefore(dragging, ev.target);
};

const over = ev => {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
};

const drop = ev => {
  dragging.classList.remove("item--dragging");
};

document.querySelectorAll(".item").forEach(node => {
  node.draggable = true;
});

document.querySelectorAll(".parent").forEach(node => {
  node.addEventListener("dragstart", drag);
  node.addEventListener("dragleave", leave);
  node.addEventListener("dragover", over);
  node.addEventListener("drop", drop);
});
