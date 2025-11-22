"use client";

import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Todo } from '@/types';
import Button from './Button';
import { Calendar, TrashIcon } from 'lucide-react';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  todo_date: z.string().optional(),
  priority: z.enum(['extreme', 'moderate', 'low']).optional(),
});

type TodoFormData = z.infer<typeof todoSchema>;

interface TodoFormProps {
  todo?: Todo;
  onSubmit: (data: { title: string; description?: string; todo_date?: string; priority?: 'extreme' | 'moderate' | 'low' }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TodoForm({ todo, onSubmit, onCancel, isLoading }: TodoFormProps) {
  const dateRef = useRef<(HTMLInputElement & { showPicker?: () => void }) | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: todo
      ? {
          title: todo.title,
          description: todo.description || '',
          todo_date: todo.todo_date || '',
          priority: todo.priority || 'moderate',
        }
      : {
          priority: 'moderate',
        },
  });

  const selectedPriority = watch('priority');

  const handleFormSubmit = async (data: TodoFormData) => {
    await onSubmit(data);
    if (!todo) {
      reset();
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          {...register('title')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <div className="relative">
          {/* Controlled date input so we can reference it and avoid register ref merging */}
          {(() => {
            const todoDate = watch('todo_date') || '';
            return (
              <>
                <input
                  type="date"
                  value={todoDate}
                  onChange={(e) => setValue('todo_date', e.target.value)}
                  ref={dateRef}
                  min={getTodayDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (dateRef.current) {
                      if (typeof dateRef.current.showPicker === 'function') {
                        try {
                          dateRef.current.showPicker!();
                        } catch {
                          dateRef.current.focus();
                        }
                      } else {
                        dateRef.current.focus();
                      }
                    }
                  }}
                  aria-label="Open date picker"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </>
            );
          })()}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Priority</label>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              value="extreme"
              {...register('priority')}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedPriority === 'extreme'
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-300 bg-white group-hover:border-red-300'
              }`}
              onClick={() => setValue('priority', 'extreme')}
            >
              {selectedPriority === 'extreme' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-gray-700 font-medium">Extreme</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              value="moderate"
              {...register('priority')}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedPriority === 'moderate'
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 bg-white group-hover:border-green-300'
              }`}
              onClick={() => setValue('priority', 'moderate')}
            >
              {selectedPriority === 'moderate' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-gray-700 font-medium">Moderate</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              value="low"
              {...register('priority')}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedPriority === 'low'
                  ? 'border-yellow-500 bg-yellow-500'
                  : 'border-gray-300 bg-white group-hover:border-yellow-300'
              }`}
              onClick={() => setValue('priority', 'low')}
            >
              {selectedPriority === 'low' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-gray-700 font-medium">Low</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Task Description</label>
        <textarea
          {...register('description')}
          rows={6}
          placeholder="Start writing here....."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="bg-[#5272FF] text-white px-6 py-2 cursor-pointer"
        >
          Done
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 bg-red-500 hover:bg-red-600 cursor-pointer rounded-lg flex items-center justify-center transition-colors"
        >
          <TrashIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </form>
  );
}
