async function loadSystemInfo() {
    const info = await window.desktop.getSystemInfo();

    document.getElementById('platform').textContent = info.platform;
    document.getElementById('architecture').textContent = info.architecture;
    document.getElementById('cpu-count').textContent = info.cpuCount;
    document.getElementById('total-memory').textContent = info.totalMemory;
    document.getElementById('free-memory').textContent = info.freeMemory;
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
    await loadSystemInfo();
    await loadProcessInfo();
  } catch (error) {
    console.error('Failed to initialize diagnostics:', error);
  }
}

init();