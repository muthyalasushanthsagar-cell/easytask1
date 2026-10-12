import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import { useToast } from '../components/Toast.jsx';
import { getErrorMessage, groceryApi } from '../services/api.js';

const COLORS = ['#4f46e5', '#16a34a', '#ea580c', '#db2777', '#0891b2', '#7c3aed'];

function Swatches({ value, onPick }) {
  return (
    <div className="swatches">
      {COLORS.map((c) => (
        <button
          type="button"
          key={c}
          className={`swatch ${value === c ? 'selected' : ''}`}
          style={{ background: c }}
          onClick={() => onPick(c)}
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  );
}

function ListCard({ list, onToggle, onAddItem, onRemoveItem, onRemoveList, onColor }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const color = list.color || COLORS[0];

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await onAddItem(list.id, {
      name: name.trim(),
      quantity: quantity === '' ? 1 : Number(quantity),
      unit: unit.trim() || null,
      category: null
    });
    if (ok) {
      setName('');
      setQuantity('1');
      setUnit('');
    }
  };

  return (
    <div className="list-card" style={{ borderTopColor: color }}>
      <div className="list-head">
        <div>
          <h3>{list.title}</h3>
          {list.description && <p className="muted">{list.description}</p>}
        </div>
        <button type="button" className="icon-btn danger" onClick={() => onRemoveList(list)} title="Delete checklist">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="progress-head small">
        <span>
          {list.purchasedItems} of {list.totalItems} done
        </span>
        <span>{list.progress}%</span>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${list.progress}%`, background: color }} />
      </div>

      <Swatches value={color} onPick={(c) => onColor(list, c)} />

      <ul className="items">
        {list.items.length === 0 && <li className="muted">No items yet</li>}
        {list.items.map((item) => (
          <li key={item.id} className={item.purchased ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={item.purchased} onChange={() => onToggle(item)} />
              <span className="item-name">{item.name}</span>
              <span className="muted">
                {item.quantity != null ? Number(item.quantity) : ''} {item.unit || ''}
              </span>
            </label>
            <button type="button" className="icon-btn" onClick={() => onRemoveItem(item)} title="Remove item">
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>

      <form className="item-form" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add item..." maxLength={200} />
        <input
          className="narrow"
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          aria-label="Quantity"
        />
        <input className="narrow" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unit" maxLength={30} />
        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
}

export default function GroceryPage() {
  const toast = useToast();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      setLists(await groceryApi.list());
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Runs an API call, reloads the lists and reports errors. Returns true on success.
  const run = async (fn, okMessage) => {
    try {
      await fn();
      if (okMessage) toast.success(okMessage);
      await load();
      return true;
    } catch (e) {
      toast.error(getErrorMessage(e));
      return false;
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const ok = await run(
      () => groceryApi.createList({ title: newTitle.trim(), description: '', color: newColor }),
      'Checklist created'
    );
    if (ok) setNewTitle('');
  };

  const changeColor = (list, color) =>
    run(() => groceryApi.updateList(list.id, { title: list.title, description: list.description || '', color }));

  const confirmDelete = async () => {
    const list = deleting;
    setDeleting(null);
    if (list) await run(() => groceryApi.removeList(list.id), 'Checklist deleted');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Everyday checklists</h2>
          <p className="muted">Groceries, household supplies, shopping lists and more</p>
        </div>
      </div>

      <form className="new-list" onSubmit={createList}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New checklist name (e.g. Weekly Groceries)"
          maxLength={150}
        />
        <Swatches value={newColor} onPick={setNewColor} />
        <button type="submit" className="btn btn-primary" disabled={!newTitle.trim()}>
          <Plus size={16} /> Create
        </button>
      </form>

      {loading && <div className="state-box">Loading checklists...</div>}

      {error && (
        <div className="state-box error">
          <p>{error}</p>
          <button type="button" className="btn btn-ghost" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && lists.length === 0 && <div className="state-box">No checklists yet. Create your first one above.</div>}

      <div className="lists-grid">
        {!error &&
          lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onToggle={(item) => run(() => groceryApi.toggleItem(item.id))}
              onAddItem={(listId, body) => run(() => groceryApi.addItem(listId, body))}
              onRemoveItem={(item) => run(() => groceryApi.removeItem(item.id))}
              onRemoveList={setDeleting}
              onColor={changeColor}
            />
          ))}
      </div>

      <DeleteConfirmModal
        open={deleting !== null}
        itemLabel="checklist"
        title={deleting ? deleting.title : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
