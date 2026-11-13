/* كمّل — طبقة البيانات: Firebase (مشتركة بين الجميع) أو محلية (عند عدم وجود إعدادات) */
window.KMStore = (() => {
  const dk = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const win = () => { const t = new Date(); return [dk(t), dk(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 7))]; };
  const slotIds = (p, d, h, dur) => Array.from({ length: dur }, (_, i) => `${p}_${d}_${h + i}`);
  const TAKEN = new Error('taken'), FULL = new Error('full');

  /* ——— Firebase ——— */
  function firebase(cfg, emit) {
    const F = window.FB, app = F.initializeApp(cfg), auth = F.getAuth(app), db = F.getFirestore(app);
    const S = { ready: false, uid: null, pitches: [], matches: [], books: [], me: null, live: true };
    const col = n => F.collection(db, n);
    let subs = [], gotP = false, gotM = false, gotB = false;
    const ready = () => { if (gotP && gotM && gotB && !S.ready) { S.ready = true; } emit(); };
    function subscribe() {
      subs.forEach(u => u()); const [a, b] = win();
      const err = e => { S.error = e.code || e.message; emit(); };
      subs = [
        F.onSnapshot(col('pitches'), s => { S.pitches = s.docs.map(d => ({ id: d.id, ...d.data() })); gotP = true; ready(); }, err),
        F.onSnapshot(F.query(col('matches'), F.where('d', '>=', a), F.where('d', '<=', b)), s => { S.matches = s.docs.map(d => ({ id: d.id, ...d.data() })); gotM = true; ready(); }, err),
        F.onSnapshot(F.query(col('bookings'), F.where('d', '>=', a), F.where('d', '<=', b)), s => { S.books = s.docs.map(d => ({ id: d.id, ...d.data() })); gotB = true; ready(); }, err),
      ];
    }
    F.onAuthStateChanged(auth, async u => {
      if (!u) { F.signInAnonymously(auth).catch(e => { S.error = e.code; emit(); }); return; }
      S.uid = u.uid;
      try { const d = await F.getDoc(F.doc(db, 'users', u.uid)); S.me = d.exists() ? d.data() : null; } catch (e) {}
      subscribe(); emit();
    });
    // تحديث نافذة الأيام عند منتصف الليل أو عند العودة للتطبيق
    let day = win()[0];
    document.addEventListener('visibilitychange', () => { if (!document.hidden && win()[0] !== day && S.uid) { day = win()[0]; subscribe(); } });

    const api = {
      S,
      async saveMe(me) { S.me = me; await F.setDoc(F.doc(db, 'users', S.uid), me); },
      async addPitch(p) { const ref = F.doc(col('pitches')); await F.setDoc(ref, { ...p, owner: S.uid, at: Date.now() }); return ref.id; },
      async delPitch(id) { await F.deleteDoc(F.doc(db, 'pitches', id)); },
      async reserve(kind, data) { // kind: matches | bookings
        const ref = F.doc(col(kind)), ids = slotIds(data.p, data.d, data.h, data.dur);
        await F.runTransaction(db, async tx => {
          const snaps = await Promise.all(ids.map(id => tx.get(F.doc(db, 'slots', id))));
          if (snaps.some(s => s.exists())) throw TAKEN;
          ids.forEach((id, i) => tx.set(F.doc(db, 'slots', id), { p: data.p, d: data.d, h: data.h + i, u: S.uid, ref: ref.id }));
          tx.set(ref, { ...data, at: Date.now() });
        });
        return ref.id;
      },
      async cancel(kind, x) {
        const b = F.writeBatch(db); b.delete(F.doc(db, kind, x.id));
        slotIds(x.p, x.d, x.h, x.dur).forEach(id => b.delete(F.doc(db, 'slots', id))); await b.commit();
      },
      async join(id, n, k) {
        const ref = F.doc(db, 'matches', id);
        await F.runTransaction(db, async tx => {
          const s = await tx.get(ref); if (!s.exists()) throw FULL;
          const m = s.data(), have = Object.values(m.pl || {}).reduce((a, x) => a + x.k, 0);
          if (have + k > m.fmt * 2) throw FULL;
          tx.update(ref, { [`pl.${S.uid}`]: { n, k, t: Date.now() } });
        });
      },
      async leave(id) { await F.runTransaction(db, async tx => { tx.update(F.doc(db, 'matches', id), { [`pl.${S.uid}`]: F.deleteField() }); }); },
    };
    return api;
  }

  /* ——— محلي (للتجربة بدون إعدادات) ——— */
  function local(emit) {
    const K = 'kammil:local';
    let D; try { D = JSON.parse(localStorage.getItem(K)); } catch (e) {}
    D = D || { uid: 'u' + Math.random().toString(36).slice(2, 10), me: null, pitches: [], matches: [], books: [], slots: {} };
    const S = { ready: true, uid: D.uid, pitches: [], matches: [], books: [], me: D.me, live: false };
    const sync = () => { const [a, b] = win(); S.pitches = D.pitches; S.matches = D.matches.filter(m => m.d >= a && m.d <= b); S.books = D.books.filter(m => m.d >= a && m.d <= b); S.me = D.me;
      try { localStorage.setItem(K, JSON.stringify(D)); } catch (e) {} setTimeout(emit, 0); };
    window.addEventListener('storage', e => { if (e.key === K) { D = JSON.parse(e.newValue); sync(); } });
    const id = () => Math.random().toString(36).slice(2, 12);
    sync();
    return {
      S, _D: () => D, _set: x => { D = x; sync(); },
      async saveMe(me) { D.me = me; sync(); },
      async addPitch(p) { const x = { ...p, id: id(), owner: D.uid, at: Date.now() }; D.pitches.push(x); sync(); return x.id; },
      async delPitch(pid) { D.pitches = D.pitches.filter(p => p.id !== pid); sync(); },
      async reserve(kind, data) {
        const ids = slotIds(data.p, data.d, data.h, data.dur); if (ids.some(s => D.slots[s])) throw TAKEN;
        const x = { ...data, id: id(), at: Date.now() }; ids.forEach(s => { D.slots[s] = x.id; });
        (kind === 'matches' ? D.matches : D.books).push(x); sync(); return x.id;
      },
      async cancel(kind, x) { if (kind === 'matches') D.matches = D.matches.filter(m => m.id !== x.id); else D.books = D.books.filter(m => m.id !== x.id);
        slotIds(x.p, x.d, x.h, x.dur).forEach(s => delete D.slots[s]); sync(); },
      async join(mid, n, k) { const m = D.matches.find(x => x.id === mid); if (!m) throw FULL;
        const have = Object.values(m.pl).reduce((a, x) => a + x.k, 0); if (have + k > m.fmt * 2) throw FULL;
        m.pl[D.uid] = { n, k, t: Date.now() }; sync(); },
      async leave(mid) { const m = D.matches.find(x => x.id === mid); if (m) delete m.pl[D.uid]; sync(); },
    };
  }

  return { create(emit) { const c = window.KM_FIREBASE; return c && c.apiKey && window.FB ? firebase(c, emit) : local(emit); }, TAKEN, FULL };
})();
