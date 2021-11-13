const code = document.querySelector("pre code");

let fileHandle;

document.querySelector("button[open]").addEventListener("click", async () => {
  if (!window.chooseFileSystemEntries)
    return alert("File System API not available");

  fileHandle = await window.chooseFileSystemEntries();
  const filename = fileHandle.name;
  const ext = filename.split(".").pop();

  const file = await fileHandle.getFile();
  const contents = await file.text();

  code.innerHTML = contents;
  code.className = `language-${ext}`;

  document.querySelector("header div").innerText = fileHandle.name;
  document.querySelector("main").setAttribute("open", "");
  document.querySelector('pre').contentEditable = true;
  document.querySelector("button[save]").disabled = false;
});

document.querySelector("button[save]").addEventListener("click", async () => {
  const writer = await fileHandle.createWriter();
  await writer.truncate(0);
  await writer.write(0, code.innerText);
  await writer.close();
});
