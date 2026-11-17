import React, { useState } from 'react';
import { Check, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TodoItem } from '../types/lily';

interface TodoWorkspaceProps {
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoWorkspace: React.FC<TodoWorkspaceProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const [newTodoText, setNewTodoText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTodoText.trim();
    if (!trimmed) return;
    onAddTodo(trimmed);
    setNewTodoText('');
  };

  const remainingCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="flex flex-col h-full">
      {/* Add New Task Form (FR-06) */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-2.5">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a task for today..."
          aria-label="New to-do item"
          maxLength={140}
          className="flex-1 min-w-0 h-10 px-3.5 rounded-xl bg-[#FDF8F0]/90 border border-[#4A5568]/18 text-[13px] text-[#2D3748] placeholder:text-[#4A5568]/60 focus:outline-none focus:border-[#79B4E8] focus:ring-3 focus:ring-[#79B4E8]/20 transition-all"
        />
        <button
          type="submit"
          disabled={!newTodoText.trim()}
          aria-label="Add task"
          className="h-10 px-3.5 rounded-xl bg-[#E5A93C] hover:bg-[#F4C472] active:scale-95 disabled:opacity-45 disabled:hover:bg-[#E5A93C] disabled:active:scale-100 text-[#281900] text-[13px] font-semibold inline-flex items-center gap-1 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] shadow-xs"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Add</span>
        </button>
      </form>

      {/* Summary Meta Line */}
      {todos.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-[#4A5568] px-1 mb-2">
          <span className="font-mono tabular-nums font-medium">
            {remainingCount} remaining · {todos.length - remainingCount} done
          </span>
          <span className="text-[10.5px] opacity-75">
            Done items clear at midnight
          </span>
        </div>
      )}

      {/* Task List with AnimatePresence */}
      {todos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-7 px-4 rounded-xl bg-[#FDF8F0]/60 border border-[#4A5568]/10"
        >
          <div className="w-10 h-10 rounded-full bg-[#79B4E8]/15 flex items-center justify-center mb-2">
            <CheckCircle2
              className="w-5 h-5 text-[#0060AC]"
              aria-hidden="true"
            />
          </div>
          <p className="text-[13px] font-semibold text-[#2D3748]">
            Your list is clear
          </p>
          <p className="text-xs text-[#4A5568] mt-0.5 max-w-[240px]">
            Add a small task above and press Enter whenever you’re ready.
          </p>
        </motion.div>
      ) : (
        <ul className="space-y-1.5 overflow-y-auto cozy-scroll pr-1 max-h-[300px]">
          <AnimatePresence initial={false}>
            {todos.map((todo) => (
              <motion.li
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.94,
                  height: 0,
                  marginBottom: 0,
                  transition: { duration: 0.18 },
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`group flex items-center gap-1.5 rounded-xl px-2 py-0.5 transition-colors duration-150 border ${
                  todo.completed
                    ? 'bg-[#FDF8F0]/50 border-transparent'
                    : 'bg-white/50 hover:bg-white/80 border-white/80 shadow-2xs'
                }`}
              >
                <motion.button
                  type="button"
                  role="checkbox"
                  whileTap={{ scale: 0.88 }}
                  aria-checked={todo.completed}
                  aria-label={
                    todo.completed
                      ? `Mark "${todo.text}" incomplete`
                      : `Complete "${todo.text}"`
                  }
                  onClick={() => onToggleTodo(todo.id)}
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4A90E2]"
                >
                  <span
                    className={`w-[19px] h-[19px] rounded-[6px] flex items-center justify-center transition-all duration-200 ${
                      todo.completed
                        ? 'bg-[#4A90E2] border border-[#4A90E2] shadow-[0_0_8px_rgba(74,144,226,0.3)]'
                        : 'bg-[#FFFDF9] border-[1.5px] border-[#79B4E8] group-hover:border-[#4A90E2]'
                    }`}
                  >
                    {todo.completed && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 25,
                        }}
                      >
                        <Check
                          className="w-3.5 h-3.5 text-white stroke-[2.75]"
                          aria-hidden="true"
                        />
                      </motion.span>
                    )}
                  </span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => onToggleTodo(todo.id)}
                  className={`flex-1 min-w-0 text-left text-[13px] leading-snug py-2 cursor-pointer break-words transition-colors ${
                    todo.completed
                      ? 'line-through text-[#4A5568]/60 italic'
                      : 'text-[#2D3748]'
                  }`}
                >
                  {todo.text}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteTodo(todo.id)}
                  aria-label={`Delete task "${todo.text}"`}
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[#4A5568]/70 hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/60 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4A90E2]"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};
