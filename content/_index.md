---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2022-10-24
type: landing

design:
  # Default section spacing
  spacing: '6rem'

sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: me
      text: |
        <div class="mt-4">
          <h3 class="text-sm font-semibold uppercase tracking-wide mb-2">Technical</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Python</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Java + JUnit</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Machine Learning</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Deep Learning</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">MatLab</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">R</span>
          </div>
          <h3 class="text-sm font-semibold uppercase tracking-wide mb-2">Languages</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">English (native)</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Chinese (fluent)</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Spanish (learning!)</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Japanese (learning!)</span>
          </div>
          <h3 class="text-sm font-semibold uppercase tracking-wide mb-2">In my free time, I like to...</h3>
          <div class="flex flex-wrap gap-2">
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Swim (former NCAA D1 Athlete)</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Listen to music</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Make films</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Write</span>
            <span class="rounded-full bg-primary-100 dark:bg-primary-900 px-3 py-1 text-sm text-primary-800 dark:text-primary-200">Wander</span>
          </div>
        </div>
      button:
      headings:
        about: 'About Me'
        education: ''
        interests: 'Academic Interests'
    design:
      background:
        gradient_mesh:
          enable: true

      # Name heading sizing to accommodate long or short names
      name:
        size: md # Options: xs, sm, md, lg (default), xl

      # Avatar customization
      avatar:
        size: medium # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: circle # Options: circle (default), square, rounded
---
