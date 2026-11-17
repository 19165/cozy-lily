import React, { useState } from 'react';
import { Check, Plus, Trash2, CheckCircle2 } from 'lucide-react';
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
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a task for today..."
          aria-label="New to-do item"
          maxLength={140}
          className="flex-1 min-w-0 h-10 px-3.5 rounded-xl bg-[#FDF8F0]/85 border border-[#4A5568]/15 text-[13px] text-[#2D3748] placeholder:text-[#4A5568]/60 focus:outline-none focus:border-[#79B4E8] focus:shadow-[0_0_0_3px_rgba(121,180,232,0.22)] transition-all"
        />
        <button
          type="submit"
          disabled={!newTodoText.trim()}
          aria-label="Add task"
          className="h-10 px-3.5 rounded-xl bg-[#E5A93C] hover:bg-[#F4C472] disabled:opacity-45 disabled:hover:bg-[#E5A93C] text-[#281900] text-[13px] font-semibold inline-flex items-center gap-1 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Add</span>
        </button>
      </form>

      {/* Summary Meta Line */}
      {todos.length > 0 && (
        <div className="flex items-center justify-between text-xs text-[#4A5568] px-1 mb-2">
          <span className="font-mono tabular-nums">
            {remainingCount} remaining · {todos.length - remainingCount} done
          </span>
          <span>Completed items clear at midnight</span>
        </div>
      )}

      {/* Task List */}
      {todos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 rounded-xl bg-[#FDF8F0]/55 border border-[#4A5568]/10">
          <CheckCircle2
            className="w-7 h-7 text-[#79B4E8] mb-2"
            aria-hidden="true"
          />
          <p className="text-[13px] font-semibold text-[#2D3748]">
            Your list is clear
          </p>
          <p className="text-xs text-[#4A5568] mt-1 max-w-[240px]">
            Add a small task above and press Enter whenever you’re ready.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5 overflow-y-auto cozy-scroll pr-1 max-h-[300px]">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`group flex items-center gap-1 rounded-xl px-1.5 py-0.5 transition-colors duration-150 ${
                todo.completed
                  ? 'bg-[#FDF8F0]/45'
                  : 'hover:bg-white/70 bg-white/35'
              }`}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={todo.completed}
                aria-label={
                  todo.completed
                    ? `Mark "${todo.text}" incomplete`
                    : `Complete "${todo.text}"`
                }
                onClick={() => onToggleTodo(todo.id)}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4A90E2]"
              >
                <span
                  className={`w-[18px] h-[18px] rounded-[6px] flex items-center justify-center transition-all duration-200 ${
                    todo.completed
                      ? 'bg-[#4A90E2] border border-[#4A90E2]'
                      : 'bg-[#FFFDF9] border-[1.5px] border-[#79B4E8] group-hover:border-[#4A90E2]'
                  }`}
                >
                  {todo.completed && (
                    <Check
                      className="w-3 h-3 text-white stroke-[2.75]"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggleTodo(todo.id)}
                className={`flex-1 min-w-0 text-left text-[13px] leading-snug py-2 cursor-pointer break-words transition-colors ${
                  todo.completed
                    ? 'line-through text-[#4A5568]/65'
                    : 'text-[#2D3748]'
                }`}
              >
                {todo.text}
              </button>

              <button
                type="button"
                onClick={() => onDeleteTodo(todo.id)}
                aria-label={`Delete task "${todo.text}"`}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[#4A5568]/70 hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50 opacity-85 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4A90E2]"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
