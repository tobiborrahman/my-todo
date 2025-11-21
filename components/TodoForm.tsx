'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Todo } from '@/types';
import Button from './Button';

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
      {/* Title Field */}
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

      {/* Date Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <div className="relative">
          <input
            type="date"
            {...register('todo_date')}
            min={getTodayDate()}
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Priority Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Priority</label>
        <div className="flex items-center space-x-6">
          {/* Extreme */}
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

          {/* Moderate */}
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

          {/* Low */}
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

      {/* Task Description */}
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

      {/* Action Buttons */}
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
          className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
