let activePlayerIndex = null;

function openPlayerModal(i) {
  activePlayerIndex = i;
  const p             = state.assigned[i];
  const isGhost       = p.alive === false;
  const isQuarantined = !!state.quarantined[i];

  document.getElementById('pm-icon').textContent = p.icon;
  document.getElementById('pm-name').textContent = p.player;

  const badge = document.getElementById('pm-status-badge');
  badge.textContent = isGhost ? 'Ghost' : 'Alive';
  badge.className   = 'pm-status-badge ' + (isGhost ? 'ghost' : 'alive');

  document.getElementById('pm-role-reveal').classList.remove('open');
  document.getElementById('pm-role-toggle').classList.remove('open');
  document.getElementById('pm-role-toggle')
    .querySelector('span:first-child').textContent = '👁 Show Role Info';

  document.getElementById('pm-role-icon').textContent = p.icon;
  document.getElementById('pm-role-name').textContent = p.role;
  document.getElementById('pm-role-cat').textContent  = p.cat;

  const originalEl = document.getElementById('pm-role-original');
  if (p.originalId && p.originalId !== p.id) {
    originalEl.textContent   = 'Started as ' + p.originalIcon + ' ' + p.originalRole;
    originalEl.style.display = 'block';
  } else {
    originalEl.style.display = 'none';
  }

  renderRoleHistory(i);

  const toggleBtn = document.getElementById('pm-toggle-status');
  toggleBtn.style.display = isGhost ? 'flex' : 'none';

  const changeCharBtn = document.getElementById('pm-change-character');
  if (changeCharBtn) changeCharBtn.style.display = isGhost ? 'none' : 'flex';

  const quarantineBtn   = document.getElementById('pm-quarantine');
  const quarantineLabel = document.getElementById('pm-quarantine-label');
  if (quarantineBtn) {
    quarantineBtn.style.display = isGhost ? 'none' : 'flex';
    quarantineLabel.textContent = isQuarantined ? 'Remove Quarantine' : 'Quarantine Player';
    quarantineBtn.querySelector('.pab-sub').textContent = isQuarantined
      ? 'Remove grey quarantine overlay'
      : 'Add grey quarantine overlay';
  }

  const taxBtn = document.getElementById('pm-executioner-target');
  if (taxBtn) {
    if (p.id === 'executioner' && !isGhost) {
      taxBtn.style.display = 'flex';
      const target     = state.taxCollectorTargets[i];
      const targetName = target !== undefined ? state.assigned[target]?.player : 'None';
      document.getElementById('pm-executioner-label').textContent = 'Set Target';
      taxBtn.querySelector('.pab-sub').textContent = 'Currently: ' + targetName;
    } else {
      taxBtn.style.display = 'none';
    }
  }

  const nullifierBtn = document.getElementById('pm-nullifier-select');
  const isNullifier  = p.id === 'nullifier';
  if (nullifierBtn) {
    nullifierBtn.style.display = (isNullifier && !isGhost) ? 'flex' : 'none';
    if (isNullifier && !isGhost) {
      const currentTarget = state.nullifierTargets[i];
      const nullSub = nullifierBtn.querySelector('.pab-sub');
      nullSub.textContent = currentTarget !== undefined
        ? 'Currently: ' + state.assigned[currentTarget]?.player
        : 'No target set';
    }
  }

  const weaverBtn = document.getElementById('pm-weaver-assign');
  if (weaverBtn) {
    weaverBtn.style.display = (p.id === 'weaver' && !isGhost) ? 'flex' : 'none';
  }

  const knightBtn = document.getElementById('pm-knight-select');
  if (knightBtn) {
    if (p.id === 'knight' && !isGhost) {
      knightBtn.style.display = 'flex';
      const currentTarget = state.knightTargets[activePlayerIndex];
      const targetName    = currentTarget !== undefined
        ? state.assigned[currentTarget]?.player : 'None';
      document.getElementById('pm-knight-label').textContent = 'Set Knight Target';
      knightBtn.querySelector('.pab-sub').textContent = 'Currently watching: ' + targetName;
    } else {
      knightBtn.style.display = 'none';
    }
  }

  const matchmakerBtn = document.getElementById('pm-matchmaker-set');
  if (matchmakerBtn) {
    if (p.id === 'matchmaker' && !isGhost) {
      matchmakerBtn.style.display = 'flex';
      matchmakerBtn.querySelector('.pab-sub').textContent =
        state.lovers.length === 2
          ? (state.assigned[state.lovers[0]]?.player || '?') + ' & ' +
            (state.assigned[state.lovers[1]]?.player || '?')
          : 'No lovers set';
    } else {
      matchmakerBtn.style.display = 'none';
    }
  }

  const killBtn = document.getElementById('pm-kill');
  if (killBtn) {
    killBtn.style.display = isGhost ? 'none' : 'flex';
  }

    const monkBtn    = document.getElementById('pm-monk-protect');
  const isMonk     = p.id === 'monk';
  if (monkBtn) {
    monkBtn.style.display = (isMonk && !isGhost) ? 'flex' : 'none';
    if (isMonk && !isGhost) {
      const currentTarget = state.monkProtections[i];
      const monkLabel     = document.getElementById('pm-monk-label');
      const monkSub       = monkBtn.querySelector('.pab-sub');
      if (currentTarget !== undefined) {
        const targetName = state.assigned[currentTarget]?.player;
        monkLabel.textContent = 'Change Monk Protection';
        monkSub.textContent   = 'Currently protecting: ' + targetName;
        monkBtn.classList.add('monk-active');
      } else {
        monkLabel.textContent = 'Set Monk Protection';
        monkSub.textContent   = 'Choose a player to protect';
        monkBtn.classList.remove('monk-active');
      }
    }
  }


  const farmerBtn    = document.getElementById('pm-farmer-select');
  const farmerInGame = getRolesInGame().includes('farmer');
  const isFarmer     = p.id === 'farmer';
  if (farmerBtn) {
    farmerBtn.style.display = (farmerInGame && isFarmer && !isGhost) ? 'flex' : 'none';
    if (farmerInGame && isFarmer && !isGhost) {
      const currentTarget = state.farmerSelections[i];
      const farmerLabel   = document.getElementById('pm-farmer-label');
      const farmerSub     = farmerBtn.querySelector('.pab-sub');
      if (currentTarget !== undefined) {
        const targetName = state.assigned[currentTarget].player;
        farmerLabel.textContent = 'Change Farmer Selection';
        farmerSub.textContent   = 'Currently watching: ' + targetName;
        farmerBtn.classList.add('farmer-active');
      } else {
        farmerLabel.textContent = 'Select Farmer Target';
        farmerSub.textContent   = 'Choose a player to watch';
        farmerBtn.classList.remove('farmer-active');
      }
    }
  }

  document.getElementById('modal-player').classList.add('open');
}

function renderRoleHistory(i) {
  const p         = state.assigned[i];
  const historyEl = document.getElementById('pm-role-history');
  const lines     = [];

   if (p.id === 'monk') {
    if (p.monkProtectedHistory && p.monkProtectedHistory.length > 0) {
      p.monkProtectedHistory.forEach(name => {
        lines.push({ icon: '😇', text: 'Protected ' + name, faded: true });
      });
    }
    const currentTarget = state.monkProtections[i];
    if (currentTarget !== undefined) {
      const targetName = state.assigned[currentTarget]?.player;
      if (targetName) lines.push({ icon: '😇', text: 'Protecting ' + targetName, faded: false });
    }
  }

  if (p.id === 'farmer') {
    if (p.farmerWatchHistory && p.farmerWatchHistory.length > 0) {
      p.farmerWatchHistory.forEach(name => {
        lines.push({ icon: '🌾', text: 'Watched ' + name, faded: true });
      });
    }
    const currentTarget = state.farmerSelections[i];
    if (currentTarget !== undefined) {
      const targetName = state.assigned[currentTarget]?.player;
      if (targetName) lines.push({ icon: '🌾', text: 'Watching ' + targetName, faded: false });
    }
  }

  if (!historyEl) return;
  historyEl.innerHTML = '';
  if (lines.length === 0) { historyEl.style.display = 'none'; return; }
  historyEl.style.display = 'block';
  lines.forEach(line => {
    const row = document.createElement('div');
    row.className = 'role-history-row' + (line.faded ? ' faded' : '');
    row.innerHTML =
      '<span class="rh-icon">' + line.icon + '</span>' +
      '<span class="rh-text">' + escHtml(line.text) + '</span>';
    historyEl.appendChild(row);
  });
}

function closePlayerModal() {
  document.getElementById('modal-player').classList.remove('open');
  document.getElementById('pm-role-reveal').classList.remove('open');
  document.getElementById('pm-role-toggle').classList.remove('open');
  activePlayerIndex = null;
}

function toggleRoleReveal() {
  const reveal = document.getElementById('pm-role-reveal');
  const toggle = document.getElementById('pm-role-toggle');
  const isOpen = reveal.classList.contains('open');
  reveal.classList.toggle('open', !isOpen);
  toggle.classList.toggle('open', !isOpen);
  toggle.querySelector('span:first-child').textContent =
    isOpen ? '👁 Show Role Info' : '🙈 Hide Role Info';
}

function togglePlayerStatus() {
  if (activePlayerIndex === null) return;
  const p = state.assigned[activePlayerIndex];
  if (p.alive === false) {
    p.alive = true;
    delete p.deathMethod;
  }

  saveState();
  openPlayerModal(activePlayerIndex);
  renderArena();
}

function openKillModal(idx) {
  if (idx === null || idx === undefined) return;
  activePlayerIndex = idx;
  const p = state.assigned[idx];
  document.getElementById('kill-modal-name').textContent = p.player;
  document.getElementById('kill-btn-execute').onclick = () => markPlayerDead(idx, 'executed');
  document.getElementById('kill-btn-kill').onclick    = () => markPlayerDead(idx, 'killed');
  document.getElementById('kill-modal-overlay').classList.add('open');
}

/* Shared list-of-living-players picker used by every target-choosing role */
function openTargetPicker(overlayId, listId, actorIdx, isSelected, onSelect) {
  const list = document.getElementById(listId);
  list.innerHTML = '';
  state.assigned.forEach((p, i) => {
    if (i === actorIdx) return;
    if (p.alive === false) return;
    const sel = isSelected(i);
    const row = document.createElement('button');
    row.className = 'farmer-pick-row' + (sel ? ' selected' : '');
    row.innerHTML =
      '<span class="fp-icon">' + p.icon + '</span>' +
      '<span class="fp-name">' + escHtml(p.player) + '</span>' +
      (sel ? '<span class="fp-check">✓</span>' : '');
    row.onclick = () => onSelect(i);
    list.appendChild(row);
  });
  document.getElementById(overlayId).classList.add('open');
}

function openMonkTargetPicker() {
  if (activePlayerIndex === null) return;
  openTargetPicker('modal-monk-picker', 'monk-picker-list', activePlayerIndex,
    i => state.monkProtections[activePlayerIndex] === i,
    selectMonkTarget);
}

function selectMonkTarget(targetIndex) {
  if (activePlayerIndex === null) return;
  const monk = state.assigned[activePlayerIndex];
  const prev = state.monkProtections[activePlayerIndex];

  if (prev !== undefined && prev !== targetIndex) {
    const prevName = state.assigned[prev]?.player;
    if (prevName) {
      if (!monk.monkProtectedHistory) monk.monkProtectedHistory = [];
      monk.monkProtectedHistory.push(prevName);
    }
  }

  state.monkProtections[activePlayerIndex] = targetIndex;
  saveState();
  document.getElementById('modal-monk-picker').classList.remove('open');
  openPlayerModal(activePlayerIndex);
  renderArena();
}
function openNullifierPicker(idx) {
  activePlayerIndex = idx;
  openTargetPicker('nullifier-picker-overlay', 'nullifier-picker-list', idx,
    i => state.nullifierTargets[idx] === i,
    i => {
      state.nullifierTargets[idx] = i;
      saveState();
      document.getElementById('nullifier-picker-overlay').classList.remove('open');
      openPlayerModal(idx);
      renderArena();
    });
}

function openFarmerTargetPicker() {
  if (activePlayerIndex === null) return;
  openTargetPicker('modal-farmer-picker', 'farmer-picker-list', activePlayerIndex,
    i => state.farmerSelections[activePlayerIndex] === i,
    selectFarmerTarget);
}

function selectFarmerTarget(targetIndex) {
  if (activePlayerIndex === null) return;
  const farmer = state.assigned[activePlayerIndex];
  const prev   = state.farmerSelections[activePlayerIndex];

  if (prev !== undefined && prev !== targetIndex) {
    const prevName = state.assigned[prev]?.player;
    if (prevName) {
      if (!farmer.farmerWatchHistory) farmer.farmerWatchHistory = [];
      farmer.farmerWatchHistory.push(prevName);
    }
  }

  state.farmerSelections[activePlayerIndex] = targetIndex;
  saveState();
  closeFarmerTargetPicker();
  openPlayerModal(activePlayerIndex);
  renderArena();
}

function closeFarmerTargetPicker() {
  document.getElementById('modal-farmer-picker').classList.remove('open');
}

function openKnightTargetPicker() {
  if (activePlayerIndex === null) return;
  openTargetPicker('modal-knight-picker', 'knight-picker-list', activePlayerIndex,
    i => state.knightTargets[activePlayerIndex] === i,
    selectKnightTarget);
}

function selectKnightTarget(targetIndex) {
  if (activePlayerIndex === null) return;
  state.knightTargets[activePlayerIndex] = targetIndex;
  saveState();
  document.getElementById('modal-knight-picker').classList.remove('open');
  openPlayerModal(activePlayerIndex);
  renderArena();
}

function toggleQuarantine(idx) {
  if (state.quarantined[idx]) {
    delete state.quarantined[idx];
  } else {
    state.quarantined[idx] = true;
    checkExecutionerReminder(idx);
    checkSnatcherReminder(idx);
  }
  saveState();
  closePlayerModal();
  renderArena();
}

function checkExecutionerReminder(targetIdx) {
  const executioners = [];
  Object.entries(state.taxCollectorTargets).forEach(([collectorIdx, tIdx]) => {
    if (parseInt(tIdx) === targetIdx) {
      const collector = state.assigned[collectorIdx];
      if (collector && collector.alive !== false) {
        executioners.push(collector.player);
      }
    }
  });
  if (executioners.length > 0) {
    const target = state.assigned[targetIdx];
    showReminder(
      '⚖️ Executioner Reminder',
      executioners.join(', ') + ' chose ' + target.player +
      ' — they are now quarantined. Remember to eliminate them before the next night phase.'
    );
  }
}
function checkSnatcherReminder(targetIdx) {
  const target = state.assigned[targetIdx];
  if (!target) return;
  const snatchers = state.assigned.filter(
    (p, i) => p.id === 'snatcher' && p.alive !== false && i !== targetIdx
  );
  if (snatchers.length > 0) {
    showReminder(
      '🪝 Snatcher Reminder',
      target.player + ' has been quarantined. Check if any Snatcher has chosen them — if so, apply the Snatcher\'s effect now.'
    );
  }
}

const reminderQueue = [];
let reminderShowing = false;

function showReminder(title, message, onOk) {
  reminderQueue.push({ title, message, onOk });
  if (!reminderShowing) showNextReminder();
}

function showNextReminder() {
  const next = reminderQueue.shift();
  if (!next) {
    reminderShowing = false;
    document.getElementById('reminder-overlay').classList.remove('open');
    return;
  }
  reminderShowing = true;
  document.getElementById('reminder-title').textContent   = next.title;
  document.getElementById('reminder-message').textContent = next.message;
  document.getElementById('reminder-ok-btn').onclick = () => {
    showNextReminder();
    if (next.onOk) next.onOk();
  };
  document.getElementById('reminder-overlay').classList.add('open');
}

function openTaxCollectorPicker(collectorIdx) {
  openTargetPicker('tax-picker-overlay', 'tax-picker-list', collectorIdx,
    i => state.taxCollectorTargets[collectorIdx] === i,
    i => {
      state.taxCollectorTargets[collectorIdx] = i;
      saveState();
      document.getElementById('tax-picker-overlay').classList.remove('open');
      openPlayerModal(collectorIdx);
      renderArena();
    });
}

function openWeaverPicker(weaverIdx) {
  const allRoles  = [...ROLES.monster, ...ROLES.minion];
  const inGame    = state.assigned.map(p => p.id);
  const notInGame = allRoles.filter(r => !inGame.includes(r.id));
  const monsters  = notInGame.filter(r => r.cat === 'Monster');
  const minions   = notInGame.filter(r => r.cat === 'Minion');

  const current     = state.weaverAssignments[weaverIdx] || {};
  let pickedMonster = current.monster || null;
  let pickedMinion  = current.minion  || null;

  const overlay = document.getElementById('weaver-picker-overlay');
  const list    = document.getElementById('weaver-picker-list');

  function renderList() {
    list.innerHTML = '<div class="weaver-section-label">Monsters not in game</div>';
    monsters.forEach(r => {
      const sel = pickedMonster && pickedMonster.id === r.id;
      const row = document.createElement('button');
      row.className = 'farmer-pick-row' + (sel ? ' selected' : '');
      row.innerHTML =
        '<span class="fp-icon">' + r.icon + '</span>' +
        '<span class="fp-name">' + escHtml(r.name) + '</span>' +
        (sel ? '<span class="fp-check">✓</span>' : '');
      row.onclick = () => { pickedMonster = r; renderList(); };
      list.appendChild(row);
    });

    const minionHeader = document.createElement('div');
    minionHeader.className = 'weaver-section-label';
    minionHeader.style.marginTop = '10px';
    minionHeader.textContent = 'Minions not in game';
    list.appendChild(minionHeader);

    minions.forEach(r => {
      const sel = pickedMinion && pickedMinion.id === r.id;
      const row = document.createElement('button');
      row.className = 'farmer-pick-row' + (sel ? ' selected' : '');
      row.innerHTML =
        '<span class="fp-icon">' + r.icon + '</span>' +
        '<span class="fp-name">' + escHtml(r.name) + '</span>' +
        (sel ? '<span class="fp-check">✓</span>' : '');
      row.onclick = () => { pickedMinion = r; renderList(); };
      list.appendChild(row);
    });

    document.getElementById('weaver-confirm-btn').disabled =
      !pickedMonster || !pickedMinion;
  }

  renderList();
  document.getElementById('weaver-confirm-btn').onclick = () => {
    state.weaverAssignments[weaverIdx] = { monster: pickedMonster, minion: pickedMinion };
    saveState();
    overlay.classList.remove('open');
    showWeaverReveal(pickedMonster, pickedMinion);
  };
  overlay.classList.add('open');
}

function showWeaverReveal(monster, minion) {
  document.getElementById('wr-monster-icon').textContent = monster.icon;
  document.getElementById('wr-monster-name').textContent = monster.name;
  document.getElementById('wr-minion-icon').textContent  = minion.icon;
  document.getElementById('wr-minion-name').textContent  = minion.name;
  document.getElementById('weaver-reveal-overlay').classList.add('open');
}

function openMatchmakerPicker(matchmakerIdx) {
  const list = document.getElementById('matchmaker-picker-list');
  let picks  = state.lovers.length === 2 ? [...state.lovers] : [];

  function renderList() {
    list.innerHTML = '';
    state.assigned.forEach((p, i) => {
      if (p.alive === false) return;
      const sel = picks.includes(i);
      const row = document.createElement('button');
      row.className = 'farmer-pick-row' + (sel ? ' selected' : '');
      row.innerHTML =
        '<span class="fp-icon">' + p.icon + '</span>' +
        '<span class="fp-name">'  + escHtml(p.player) + '</span>' +
        (sel ? '<span class="fp-check">💘</span>' : '');
      row.onclick = () => {
        if (sel) { picks = picks.filter(x => x !== i); }
        else if (picks.length < 2) { picks.push(i); }
        renderList();
      };
      list.appendChild(row);
    });
    document.getElementById('matchmaker-confirm-btn').disabled = picks.length !== 2;
  }

  renderList();
  document.getElementById('matchmaker-confirm-btn').onclick = () => {
    state.lovers = picks;
    saveState();
    document.getElementById('matchmaker-picker-overlay').classList.remove('open');
    openPlayerModal(matchmakerIdx);
    renderArena();
  };
  document.getElementById('matchmaker-picker-overlay').classList.add('open');
}

function openChangeCharacterPicker(idx) {
  if (idx === null || idx === undefined) return;
  activePlayerIndex = idx;
  const p = state.assigned[idx];
  const allRoles = [
    ...ROLES.monster,
    { id:'lone-wolf', name:'Lone Wolf', icon:'🌕', cat:'Monster' },
    ...ROLES.minion,
    ...ROLES.outcast,
    ...ROLES.villager,
    { id:'villager',  name:'Villager',  icon:'🏡', cat:'Villager' },
  ];

  const list = document.getElementById('change-character-list');
  list.innerHTML = '';
  allRoles.forEach(role => {
    const isCurrent = p.id === role.id;
    const row = document.createElement('button');
    row.className = 'farmer-pick-row' + (isCurrent ? ' selected' : '');
    row.innerHTML =
      '<span class="fp-icon">' + role.icon + '</span>' +
      '<span class="fp-name">' + escHtml(role.name) + ' — ' + role.cat + '</span>' +
      (isCurrent ? '<span class="fp-check">✓</span>' : '');
    row.onclick = () => applyCharacterChange(idx, role);
    list.appendChild(row);
  });

  document.getElementById('change-character-overlay').classList.add('open');
}

function applyCharacterChange(idx, role) {
  const p = state.assigned[idx];
  document.getElementById('change-character-overlay').classList.remove('open');
  if (p.id === role.id) return;

  if (!p.originalId) {
    p.originalId   = p.id;
    p.originalRole = p.role;
    p.originalIcon = p.icon;
    p.originalCat  = p.cat;
  }

  // Monk / Farmer — save history before deleting, as the death path does
  if (p.id === 'monk' && state.monkProtections[idx] !== undefined) {
    const targetName = state.assigned[state.monkProtections[idx]]?.player;
    if (targetName) {
      if (!p.monkProtectedHistory) p.monkProtectedHistory = [];
      p.monkProtectedHistory.push(targetName);
    }
  }
  if (p.id === 'farmer' && state.farmerSelections[idx] !== undefined) {
    const targetName = state.assigned[state.farmerSelections[idx]]?.player;
    if (targetName) {
      if (!p.farmerWatchHistory) p.farmerWatchHistory = [];
      p.farmerWatchHistory.push(targetName);
    }
  }

  // The old role's own target-setting effect stops — it's no longer in the game
  delete state.monkProtections[idx];
  delete state.farmerSelections[idx];
  delete state.knightTargets[idx];
  delete state.taxCollectorTargets[idx];
  delete state.nullifierTargets[idx];

  p.id             = role.id;
  p.role           = role.name;
  p.icon           = role.icon;
  p.cat            = role.cat;
  p.createdOnRound = state.round;

  saveState();
  openPlayerModal(idx);
  renderArena();
}

function markPlayerDead(idx, method) {
  const p = state.assigned[idx];

  // Monk protection saves the target from execution
  if (method === 'executed') {
    let protectingMonkIdx;
    Object.entries(state.monkProtections).forEach(([monkIdx, targetIdx]) => {
      if (parseInt(targetIdx) === idx) protectingMonkIdx = monkIdx;
    });
    if (protectingMonkIdx !== undefined) {
      const monk = state.assigned[protectingMonkIdx];
      if (monk && monk.alive !== false) {
        delete state.monkProtections[protectingMonkIdx];
        delete state.quarantined[idx];
        saveState();
        document.getElementById('kill-modal-overlay').classList.remove('open');
        closePlayerModal();
        renderArena();
        showReminder(
          '😇 Monk Protected!',
          p.player + ' was Monk protected and did not die. They lose their protection.'
        );
        return;
      }
    }
  }

  // Tanner secretly wins if executed — they don't die, they get a new role
  if (method === 'executed' && p.id === 'tanner') {
    delete state.quarantined[idx];
    saveState();
    document.getElementById('kill-modal-overlay').classList.remove('open');
    closePlayerModal();
    renderArena();
    showReminder(
      '🪵 Tanner Executed!',
      p.player + ' is the Tanner and does not die. Assign them a new role now.',
      () => openChangeCharacterPicker(idx)
    );
    return;
  }

  p.alive       = false;
  p.deathMethod = method;
  delete state.quarantined[idx];
  delete state.taxCollectorTargets[idx];

  // Monk — save history before deleting
  if (p.id === 'monk') {
    const target = state.monkProtections[idx];
    if (target !== undefined) {
      const targetName = state.assigned[target]?.player;
      if (targetName) {
        if (!p.monkProtectedHistory) p.monkProtectedHistory = [];
        p.monkProtectedHistory.push(targetName);
      }
      delete state.monkProtections[idx];
    }
  } else {
    delete state.monkProtections[idx];
  }

  // Farmer — save history before deleting
  if (p.id === 'farmer') {
    const target = state.farmerSelections[idx];
    if (target !== undefined) {
      const targetName = state.assigned[target]?.player;
      if (targetName) {
        if (!p.farmerWatchHistory) p.farmerWatchHistory = [];
        p.farmerWatchHistory.push(targetName);
      }
      delete state.farmerSelections[idx];
    }
  }

  Object.entries(state.knightTargets).forEach(([knightIdx, targetIdx]) => {
    if (parseInt(targetIdx) === idx && method === 'executed') {
      const knight = state.assigned[knightIdx];
      if (knight && knight.alive !== false) {
        state.knightReminderPending = true;
      }
    }
  });

  if (state.lovers.includes(idx)) {
    const otherIdx = state.lovers.find(x => x !== idx);
    const other    = state.assigned[otherIdx];
    if (other && other.alive !== false) {
      showReminder(
        '💘 Lovers — ' + state.assigned[idx].player + ' has died',
        other.player + ' is their lover and must also die. Tap OK then mark them as dead.',
        () => openKillModal(otherIdx)
      );
    } else {
      state.lovers = [];
    }
  }

  saveState();
  document.getElementById('kill-modal-overlay').classList.remove('open');
  closePlayerModal();
  if (!checkLoneWolfWin()) checkEvilWin();
  renderArena();
}

function checkEvilWin() {
  const living = state.assigned.filter(p => p.alive !== false);
  const allEvil = living.length > 0 &&
    living.every(p => p.cat === 'Monster' || p.cat === 'Minion');
  if (allEvil) {
    showReminder(
      '😈 Evil Wins!',
      'All living players are monsters or minions. The village has fallen.'
    );
  }
}

function checkLoneWolfWin() {
  const livingMonsters = state.assigned.filter(p => p.alive !== false && p.cat === 'Monster');
  if (livingMonsters.length === 1 && livingMonsters[0].id === 'lone-wolf') {
    showReminder(
      '🌕 Lone Wolf Wins!',
      livingMonsters[0].player + ' is the Lone Wolf and the last monster standing. They win alone!'
    );
    return true;
  }
  return false;
}
