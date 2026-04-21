/**
 * Productivity Tools SEO Keywords
 * Comprehensive keyword strategy for productivity software category
 */

import type { CategoryKeywords } from './types'

export const productivityKeywords: CategoryKeywords = {
  category: 'Productivity Tools',
  categoryId: 'productivity',
  primaryKeywords: [
    'productivity software',
    'productivity tools',
    'productivity apps',
    'productivity platform',
    'work productivity software',
    'team productivity tools',
    'productivity management',
    'efficiency software'
  ],
  secondaryKeywords: [
    'task management software',
    'project management tools',
    'note-taking apps',
    'calendar software',
    'time tracking tools',
    'collaboration software',
    'document editing tools',
    'productivity suite'
  ],
  longTailKeywords: [
    'best productivity software for remote teams',
    'productivity tools for small business owners',
    'team collaboration and productivity platform',
    'comprehensive productivity suite for professionals',
    'productivity apps for busy entrepreneurs',
    'work efficiency software for offices',
    'productivity management tools for teams',
    'digital productivity platform for businesses'
  ],
  brandKeywords: [
    'Microsoft Office alternative',
    'Google Workspace competitor',
    'Notion alternative',
    'Asana competitor',
    'Slack alternative',
    'Trello competitor'
  ],
  locationKeywords: [
    'productivity software USA',
    'productivity tools Europe',
    'work software worldwide',
    'productivity platform global'
  ],
  subcategories: {
    'task-management': {
      name: 'Task Management',
      path: '/marketplace/category/productivity-task-management',
      keywords: [
        'task management software',
        'to-do list app',
        'task tracking software',
        'task organizer',
        'task planner software',
        'personal task manager',
        'team task management',
        'task scheduling software'
      ],
      longTail: [
        'best task management software for teams',
        'personal to-do list app for productivity',
        'task tracking software for project managers',
        'comprehensive task management platform'
      ],
      searchVolume: 'high',
      competition: 'high'
    },
    'project-management': {
      name: 'Project Management',
      path: '/marketplace/category/productivity-project-management',
      keywords: [
        'project management software',
        'project planning tools',
        'project management platform',
        'project collaboration software',
        'agile project management',
        'project tracking software',
        'project management suite',
        'team project tools'
      ],
      longTail: [
        'best project management software for small teams',
        'agile project management tools for developers',
        'comprehensive project planning platform',
        'project collaboration software for remote teams'
      ],
      searchVolume: 'high',
      competition: 'high'
    },
    'note-taking': {
      name: 'Note Taking',
      path: '/marketplace/category/productivity-note-taking',
      keywords: [
        'note-taking app',
        'digital notepad',
        'note organizer software',
        'note management app',
        'smart notes app',
        'note-taking platform',
        'digital note software',
        'note synchronization app'
      ],
      longTail: [
        'best note-taking app for students and professionals',
        'digital note organizer for research',
        'comprehensive note management platform',
        'smart note-taking software for teams'
      ],
      searchVolume: 'high',
      competition: 'high'
    },
    'calendar-scheduling': {
      name: 'Calendar & Scheduling',
      path: '/marketplace/category/productivity-calendar',
      keywords: [
        'calendar software',
        'scheduling app',
        'appointment scheduling',
        'meeting scheduler',
        'calendar management',
        'booking software',
        'time scheduling platform',
        'calendar synchronization'
      ],
      longTail: [
        'best calendar software for business scheduling',
        'appointment booking software for professionals',
        'meeting scheduling platform for teams',
        'comprehensive calendar management system'
      ],
      searchVolume: 'medium',
      competition: 'medium'
    },
    'time-tracking': {
      name: 'Time Tracking',
      path: '/marketplace/category/productivity-time-tracking',
      keywords: [
        'time tracking software',
        'time management app',
        'employee time tracker',
        'project time tracking',
        'timesheet software',
        'time clock software',
        'time logging app',
        'productivity time tracker'
      ],
      longTail: [
        'best time tracking software for freelancers',
        'employee time tracking system for businesses',
        'project time management software',
        'comprehensive timesheet and billing platform'
      ],
      searchVolume: 'medium',
      competition: 'medium'
    },
    'team-collaboration': {
      name: 'Team Collaboration',
      path: '/marketplace/category/productivity-collaboration',
      keywords: [
        'team collaboration software',
        'collaboration platform',
        'team communication tools',
        'collaborative workspace',
        'team productivity platform',
        'group collaboration app',
        'team management software',
        'workplace collaboration'
      ],
      longTail: [
        'best team collaboration software for remote work',
        'comprehensive collaboration platform for businesses',
        'team communication and productivity tools',
        'collaborative workspace for distributed teams'
      ],
      searchVolume: 'high',
      competition: 'high'
    },
    'file-sharing': {
      name: 'File Sharing',
      path: '/marketplace/category/productivity-file-sharing',
      keywords: [
        'file sharing software',
        'cloud file sharing',
        'secure file transfer',
        'file collaboration platform',
        'document sharing app',
        'file sync software',
        'cloud storage sharing',
        'team file sharing'
      ],
      longTail: [
        'secure file sharing software for businesses',
        'cloud file collaboration platform for teams',
        'comprehensive file sharing and sync solution',
        'enterprise file sharing system'
      ],
      searchVolume: 'medium',
      competition: 'medium'
    },
    'automation-tools': {
      name: 'Automation Tools',
      path: '/marketplace/category/productivity-automation',
      keywords: [
        'productivity automation',
        'workflow automation tools',
        'task automation software',
        'automation platform',
        'process automation',
        'productivity automation app',
        'work automation tools',
        'business automation'
      ],
      longTail: [
        'best productivity automation tools for professionals',
        'workflow automation software for teams',
        'comprehensive task automation platform',
        'business process automation for productivity'
      ],
      searchVolume: 'medium',
      competition: 'medium'
    },
    'mind-mapping': {
      name: 'Mind Mapping',
      path: '/marketplace/category/productivity-mind-mapping',
      keywords: [
        'mind mapping software',
        'mind map creator',
        'brainstorming software',
        'visual thinking tools',
        'concept mapping app',
        'idea mapping software',
        'mind mapping platform',
        'visual brainstorming'
      ],
      longTail: [
        'best mind mapping software for creative professionals',
        'visual brainstorming tools for teams',
        'comprehensive mind mapping platform',
        'idea organization and mapping software'
      ],
      searchVolume: 'low',
      competition: 'low'
    },
    'password-managers': {
      name: 'Password Managers',
      path: '/marketplace/category/productivity-password',
      keywords: [
        'password manager',
        'password management software',
        'secure password app',
        'password vault',
        'password generator',
        'credential management',
        'password security software',
        'login manager'
      ],
      longTail: [
        'best password manager for businesses and teams',
        'secure password management software',
        'comprehensive credential management platform',
        'enterprise password security solution'
      ],
      searchVolume: 'high',
      competition: 'high'
    },
    'email-management': {
      name: 'Email Management',
      path: '/marketplace/category/productivity-email',
      keywords: [
        'email management software',
        'email productivity tools',
        'email organizer',
        'email scheduling app',
        'email automation',
        'inbox management',
        'email client software',
        'email efficiency tools'
      ],
      longTail: [
        'best email management software for professionals',
        'email productivity tools for busy executives',
        'comprehensive inbox management platform',
        'email automation and scheduling software'
      ],
      searchVolume: 'medium',
      competition: 'medium'
    },
    'habit-tracking': {
      name: 'Habit Tracking',
      path: '/marketplace/category/productivity-habits',
      keywords: [
        'habit tracking app',
        'habit tracker',
        'habit building software',
        'personal habit manager',
        'goal tracking app',
        'routine tracker',
        'habit formation app',
        'productivity habits'
      ],
      longTail: [
        'best habit tracking app for personal development',
        'comprehensive habit building and tracking platform',
        'goal and habit tracking software',
        'personal productivity habit tracker'
      ],
      searchVolume: 'medium',
      competition: 'low'
    }
  }
}
