const defaultCategoryId = 1;
const allCategoriesValue = 'all';

const state = {
  categories: [],
  routes: [],
  selectedId: null,
};

const routeList = document.querySelector('#route-list');
const logList = document.querySelector('#log-list');
const form = document.querySelector('#route-form');
const endpoint = document.querySelector('#endpoint');
const categoryToolsSelect = document.querySelector('#category-tools-select');
const summaryRoutes = document.querySelector('#summary-routes');
const summaryCategories = document.querySelector('#summary-categories');

document.querySelector('#new-route').addEventListener('click', () => {
  state.selectedId = null;
  fillForm({
    category_id: selectedFilterCategoryId() ?? defaultCategoryId,
    name: 'New API',
    method: 'GET',
    path: '/new-api',
    enabled: 1,
    mode: 'mock',
    status: 200,
    delay_ms: 0,
    match_rules: '[]',
    response_body: '{\n  "ok": true,\n  "id": "{{uuid}}"\n}',
    proxy_url: '',
  });
});

document.querySelector('#new-category').addEventListener('click', async () => {
  const name = prompt('分类名称');
  if (!name?.trim()) return;

  const category = await requestJson('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  await loadData();
  categoryToolsSelect.value = String(category.id);
  renderRoutes();
});

document.querySelector('#rename-category').addEventListener('click', async () => {
  const category = selectedToolCategory();
  if (!category) return;

  const name = prompt('新的分类名称', category.name);
  if (!name?.trim() || name.trim() === category.name) return;

  await requestJson(`/api/admin/categories/${category.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  await loadData();
});

document.querySelector('#delete-category').addEventListener('click', async () => {
  const category = selectedToolCategory();
  if (!category || category.id === defaultCategoryId) return;

  const confirmed = confirm(`删除分类“${category.name}”？该分类下接口会移动到默认分类。`);
  if (!confirmed) return;

  await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
  await loadData();
  if (state.selectedId) {
    const selected = state.routes.find((route) => route.id === state.selectedId);
    if (selected) fillForm(selected);
  }
});

document.querySelector('#save-route').addEventListener('click', async (event) => {
  event.preventDefault();
  const payload = readForm();
  const url = state.selectedId ? `/api/admin/routes/${state.selectedId}` : '/api/admin/routes';
  const method = state.selectedId ? 'PUT' : 'POST';

  const saved = await requestJson(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  state.selectedId = saved.id;
  await loadData();
});

document.querySelector('#delete-route').addEventListener('click', async (event) => {
  event.preventDefault();
  if (!state.selectedId) return;
  await fetch(`/api/admin/routes/${state.selectedId}`, { method: 'DELETE' });
  state.selectedId = null;
  await loadData();
  selectFirstRoute();
});

document.querySelector('#refresh-routes').addEventListener('click', loadData);
categoryToolsSelect.addEventListener('change', () => {
  renderRoutes();
  const selected = visibleRoutes().find((route) => route.id === state.selectedId);
  if (!selected) selectFirstRoute();
});
document.querySelector('#refresh-logs').addEventListener('click', loadLogs);
document.querySelector('#clear-logs').addEventListener('click', async () => {
  await fetch('/api/admin/logs', { method: 'DELETE' });
  await loadLogs();
});

form.addEventListener('input', updateEndpoint);

await loadData();
await loadLogs();
setInterval(loadLogs, 5000);

async function loadData() {
  const [categories, routes] = await Promise.all([
    requestJson('/api/admin/categories'),
    requestJson('/api/admin/routes'),
  ]);

  state.categories = categories;
  state.routes = routes;
  updateSummary();
  renderCategoryOptions();
  renderRoutes();

  const selected = state.routes.find((route) => route.id === state.selectedId);
  if (selected) fillForm(selected);
}

async function loadLogs() {
  const logs = await requestJson('/api/admin/logs');
  renderLogs(logs);
}

function renderCategoryOptions() {
  const previousFilter = categoryToolsSelect.value || allCategoriesValue;
  const options = state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join('');

  form.category_id.innerHTML = options;
  categoryToolsSelect.innerHTML = `<option value="${allCategoriesValue}">全部分类</option>${options}`;
  categoryToolsSelect.value = isValidFilterValue(previousFilter) ? previousFilter : allCategoriesValue;
}

function renderRoutes() {
  routeList.innerHTML = '';

  const categories = visibleCategories();
  const routes = visibleRoutes();
  const selected = routes.find((route) => route.id === state.selectedId);
  if (!selected) state.selectedId = null;

  for (const category of categories) {
    const routes = state.routes.filter((route) => route.category_id === category.id);
    const section = document.createElement('section');
    section.className = 'category-section';
    section.innerHTML = `
      <div class="category-heading">
        <span>${escapeHtml(category.name)}</span>
        <span class="route-count">${routes.length}</span>
      </div>
    `;

    if (routes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = '暂无接口';
      section.appendChild(empty);
    }

    for (const route of routes) {
      section.appendChild(renderRouteItem(route));
    }

    routeList.appendChild(section);
  }

  if (categories.length === 0) {
    routeList.innerHTML = '<p class="empty-state">暂无分类</p>';
  }

  if (!state.selectedId) selectFirstRoute();
}

function renderRouteItem(route) {
  const item = document.createElement('button');
  item.className = `route-item ${route.id === state.selectedId ? 'active' : ''} ${route.enabled === 0 ? 'disabled' : ''}`;
  item.type = 'button';
  item.innerHTML = `
    <div class="route-title">
      <strong>${escapeHtml(route.name)}</strong>
      <span class="method">${escapeHtml(route.method)}</span>
    </div>
    <div class="path">${escapeHtml(route.path)}</div>
    <div class="route-meta">
      <span class="pill ${route.mode === 'proxy' ? 'proxy' : 'mock'}">${escapeHtml(route.mode)}</span>
      <span class="pill ${route.enabled === 0 ? 'off' : 'on'}">${route.enabled === 0 ? '停用' : '启用'}</span>
      ${hasMatchRules(route) ? '<span class="pill rule">规则</span>' : ''}
    </div>
  `;
  item.addEventListener('click', () => {
    state.selectedId = route.id;
    fillForm(route);
    renderRoutes();
  });
  return item;
}

function renderLogs(logs) {
  logList.innerHTML = '';
  if (logs.length === 0) {
    logList.innerHTML = '<p class="hint">暂无请求日志</p>';
    return;
  }

  for (const log of logs) {
    const item = document.createElement('div');
    item.className = 'log-item';
    const statusClass = Number(log.status) >= 400 ? 'error' : 'ok';
    item.innerHTML = `
      <div class="route-title">
        <strong>${escapeHtml(log.method)} ${escapeHtml(log.path)}</strong>
        <span class="status ${statusClass}">${escapeHtml(String(log.status))}</span>
      </div>
      <div class="log-meta">${escapeHtml(log.duration_ms)}ms · ${escapeHtml(log.created_at)}</div>
      <pre>${escapeHtml(log.response_preview || '')}</pre>
    `;
    logList.appendChild(item);
  }
}

function updateSummary() {
  summaryRoutes.textContent = String(state.routes.length);
  summaryCategories.textContent = String(state.categories.length);
}

function hasMatchRules(route) {
  const value = String(route.match_rules ?? '').trim();
  return value !== '' && value !== '[]';
}

function selectFirstRoute() {
  const first = visibleRoutes()[0];
  if (!first) {
    document.querySelector('#new-route').click();
    return;
  }
  state.selectedId = first.id;
  fillForm(first);
  renderRoutes();
}

function fillForm(route) {
  form.category_id.value = String(route.category_id ?? defaultCategoryId);
  form.name.value = route.name ?? '';
  form.method.value = route.method ?? 'GET';
  form.path.value = route.path ?? '/';
  form.mode.value = route.mode ?? 'mock';
  form.status.value = route.status ?? 200;
  form.delay_ms.value = route.delay_ms ?? 0;
  form.match_rules.value = route.match_rules ?? '[]';
  form.enabled.checked = route.enabled !== 0;
  form.proxy_url.value = route.proxy_url ?? '';
  form.response_body.value = route.response_body ?? '{}';
  updateEndpoint();
}

function readForm() {
  return {
    category_id: Number(form.category_id.value) || defaultCategoryId,
    name: form.name.value,
    method: form.method.value,
    path: form.path.value,
    mode: form.mode.value,
    status: Number(form.status.value),
    delay_ms: Number(form.delay_ms.value),
    match_rules: form.match_rules.value,
    enabled: form.enabled.checked,
    proxy_url: form.proxy_url.value,
    response_body: form.response_body.value,
  };
}

function selectedToolCategory() {
  const id = Number(categoryToolsSelect.value);
  return state.categories.find((category) => category.id === id);
}

function selectedFilterCategoryId() {
  if (categoryToolsSelect.value === allCategoriesValue) return null;
  const id = Number(categoryToolsSelect.value);
  return state.categories.some((category) => category.id === id) ? id : null;
}

function visibleCategories() {
  const categoryId = selectedFilterCategoryId();
  if (!categoryId) return state.categories;
  return state.categories.filter((category) => category.id === categoryId);
}

function visibleRoutes() {
  const categoryId = selectedFilterCategoryId();
  if (!categoryId) return state.routes;
  return state.routes.filter((route) => route.category_id === categoryId);
}

function isValidFilterValue(value) {
  if (value === allCategoriesValue) return true;
  const id = Number(value);
  return state.categories.some((category) => category.id === id);
}

function updateEndpoint() {
  const path = form.path.value.startsWith('/') ? form.path.value : `/${form.path.value}`;
  endpoint.textContent = `调用地址：http://localhost:${location.port || 13000}/mock${path}`;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
