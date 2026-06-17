import { Task } from '../types/task';

export const MOCK_TASKS: Task[] = [
    {
        id: '1',
        name: 'Draft the project proposal',
        priority: 'high',
        isDaily: false,
        time: '9:00 AM',
        completed: false,
    },
    {
        id: '2',
        name: 'Morning pages',
        priority: undefined,
        isDaily: true,
        time: '7:30 AM',
        completed: false,
    },
    {
        id: '3',
        name: 'Reply to design feedback',
        priority: 'medium',
        isDaily: false,
        time: '2:30 PM',
        completed: false,
    },
    {
        id: '4',
        name: 'Review pull requests',
        priority: 'high',
        isDaily: false,
        time: '11:00 AM',
        completed: false,
    },
    {
        id: '5',
        name: 'Daily standup',
        priority: undefined,
        isDaily: true,
        time: '10:00 AM',
        completed: false,
    },
    {
        id: '6',
        name: 'Update project timeline',
        priority: 'low',
        isDaily: false,
        time: undefined,
        completed: false,
    },
];
