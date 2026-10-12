import { useState } from 'react';
import { getErrorMessage, taskApi } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import TaskModal from '../components/TaskModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';

// Shared create / edit / complete / reopen / delete behaviour for every page that shows tasks.
export default function useTaskCrud(onChanged) {
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null = closed, {} = new task, task object = edit
  const [deleting, setDeleting] = useState(null);

  const complete = async (task) => {
    try {
      await taskApi.complete(task.id);
      toast.success('Task completed');
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const reopen = async (task) => {
    try {
      await taskApi.reopen(task.id);
      toast.success('Task reopened');
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const save = async (payload) => {
    if (editing && editing.id) {
      await taskApi.update(editing.id, payload);
      toast.success('Task updated');
    } else {
      await taskApi.create(payload);
      toast.success('Task added');
    }
    setEditing(null);
    onChanged();
  };

  const quickAdd = async (payload) => {
    try {
      await taskApi.create(payload);
      toast.success('Task added');
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  };

  const confirmDelete = async () => {
    const task = deleting;
    setDeleting(null);
    if (!task) return;
    try {
      await taskApi.remove(task.id);
      toast.success('Task deleted');
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const modals = (
    <>
      <TaskModal
        open={editing !== null}
        task={editing && editing.id ? editing : null}
        onClose={() => setEditing(null)}
        onSave={save}
      />
      <DeleteConfirmModal
        open={deleting !== null}
        title={deleting ? deleting.title : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );

  return {
    complete,
    reopen,
    quickAdd,
    openCreate: () => setEditing({}),
    openEdit: (task) => setEditing(task),
    askDelete: (task) => setDeleting(task),
    modals
  };
}
