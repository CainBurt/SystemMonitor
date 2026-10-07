function loadSystemInfo(info) {
  const rows = [
    ['Computer', info.hostname],
    ['User', info.username],
    ['OS', `${info.osType} ${info.osRelease}`],
    ['Version', info.osVersion],
    ['Architecture', info.arch],
    ['CPU', `${info.cpuModel} (${info.cpuCores} logical cores)`],
    ['Total memory', info.totalMemory],
    ['Electron / Node', `${info.electron} / ${info.node}`],
  ];
  const list = document.getElementById('system-list');
  list.replaceChildren();
  for (const [label, value] of rows) {
    const parent = document.createElement('div');
    parent.textContent = label;
    const child = document.createElement('div');
    child.textContent = value || '–';
    list.append(parent, child);
  }
}

async function loadProcessInfo() {
    const info = await window.desktop.getProcessInfo();

    const tableBody = document.getElementById('process-table-body');
    const timestampElement = document.getElementById('process-timestamp');

    tableBody.innerHTML = '';

    info.electronProcesses.forEach((processInfo) => {
        const row = document.createElement('tr');

        row.innerHTML = `
        <td>${processInfo.pid}</td>
        <td>${processInfo.type}</td>
        <td>${processInfo.name ?? '-'}</td>
        <td>${processInfo.memory.workingSetSize} KB</td>
        <td>${processInfo.sandboxed ? 'Yes' : 'No'}</td>
        `;

        tableBody.appendChild(row);
    });

    timestampElement.textContent = info.timestamp;
}

async function init() {
  try {
    loadSystemInfo(await window.desktop.getSystemInfo());
    await loadProcessInfo();
  } catch (error) {
    console.error('Failed to initialize diagnostics:', error);
  }
}

init();